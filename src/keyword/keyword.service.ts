// test.service.ts
import { Injectable } from '@nestjs/common';
import { MySqlService } from 'src/my-sql/my-sql.service';

@Injectable()
export class KeywordService {
  constructor(private mysqlService: MySqlService) {}

  // 여행지별 키워드 리스트 반환하는 함수
  async destinationKeyword(keywordList: string[]) {
    // 여행지 ID와 관련 키워드 ID를 저장하는 Map 객체 생성
    const keywordMap = new Map<number, string[]>();
    // 각 키워드에 대해 관련 여행지를 비동기로 검색 후 map 객체에 저장
    await Promise.all(
      keywordList.map(async (keyword) => {
        // 키워드들의 id값 조회
        const keywordId = await this.mysqlService.findKeywordId(keyword);
        const id = parseInt(JSON.stringify(keywordId[0].id));
        // 키워드들의 id로 여행지 조회
        const sql = `SELECT destination_id FROM destination_keyword WHERE keyword_id = ?`;
        const params = [id];
        const foundDestination = await this.mysqlService.query(sql, params);

        // 쿼리 결과가 배열인 경우
        if (Array.isArray(foundDestination)) {
          foundDestination.map((item) => {
            // Map 객체에 여행지가 없는 경우, 빈 배열로 초기화
            if (keywordMap.get(item.destination_id) === undefined) {
              keywordMap.set(item.destination_id, []);
            }
            // 해당 여행지에 키워드 이름 추가
            keywordMap.get(item.destination_id).push(keyword);
          });
        }
      }),
    );
    // Map 객체 -> 배열로 변환하여 반환
    return Array.from(keywordMap);
  }

  // 여행지별 이름, 주소, 도시 아이디를 반환하는 함수
  async destinationList(sortedList: [number, string[]][]) {
    // 여행지 id 리스트
    const destinationIdList = sortedList.map((value) => value[0]);
    const destination = await Promise.all(
      destinationIdList.map(async (id) => {
        // 여행지 id 사용해서 이름, 주소, 도시 아이디 조회
        const result = await this.mysqlService.findDestination(id);
        return {
          name: result[0].name,
          address: result[0].address,
          cityId: result[0].city_id,
        };
      }),
    );

    return destination;
  }

  // 여행지별 지역 반환하는 함수
  async regionList(cityIdList: number[]) {
    const region = await Promise.all(
      cityIdList.map(async (id) => {
        // 도시 아이디(city_id) 사용해서 국가, 도시 조회
        const result = await this.mysqlService.getRegion(id);
        return `${result[0].country}, ${result[0].city}`;
      }),
    );
    return region;
  }

  // 키워드 기반 여행지 추천 api
  async getKeyword(keyword: string) {
    // 유저가 입력한 키워드를 공백 기준으로 분리하여 배열로 만듦
    const keywordList = keyword.split(' ');

    // 여행지별 키워드 리스트
    const keywordArr = await this.destinationKeyword(keywordList);

    // 연관 키워드가 많은 순서대로 정렬된 리스트
    const sorted = keywordArr.sort((a, b) => b[1].length - a[1].length);

    // 여행지별 이름, 주소, 도시 아이디를 반환하는 함수
    const destination = await this.destinationList(sorted);

    // cityid 배열
    const cityIdArr = destination.map((value) => value.cityId);
    // 여행지별 지역 반환하는 함수
    const region = await this.regionList(cityIdArr);

    // 연관 키워드가 많은 순서대로 정렬된 키워드 리스트
    const keywords = sorted.map((value) => value[1]);

    // response 데이터 배열(여행지 이름, 주소, 연관 키워드, 지역)
    let payload: {
      name: string;
      address: string;
      keyword: string[];
      region: string;
    }[] = [];

    // 키워드와 연관된 여행지 개수만큼 반복문 실행
    for (let i = 0; i < cityIdArr.length; i++) {
      payload.push({
        name: destination[i].name,
        address: destination[i].address,
        keyword: keywords[i],
        region: region[i],
      });
    }

    return { err: null, data: payload };
  }
}
