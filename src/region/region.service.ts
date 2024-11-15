import { Injectable } from '@nestjs/common';
import { MySqlService } from 'src/my-sql/my-sql.service';

@Injectable()
export class RegionService {
  constructor(private mysqlService: MySqlService) {}

  // 사용자가 선택한 지역에 속해있는 여행지 리스트 반환하는 함수
  async getDestination(city: string) {
    // 도시아이디 조회
    const foundCityId = await this.mysqlService.findCityId(city);
    // 여행지 조회
    const foundDestination = await this.mysqlService.findDestinationByCity(
      foundCityId[0].id,
    );

    // 사용자가 선택한 지역에 속해있는 여행지 리스트 선언
    let destination: { id: number; name: string; address: string }[] = [];
    // 여행지 조회 결과가 배열인 경우
    if (Array.isArray(foundDestination)) {
      foundDestination.map((item) => {
        // 여행지 추가
        destination.push({
          id: item.id,
          name: item.name,
          address: item.address,
        });
      });
    }

    // 사용자가 선택한 지역에 속해있는 여행지 리스트 반환
    return destination;
  }

  // 여행지별 키워드 id 리스트 반환하는 함수
  async getKeywordId(destinationIdList: number[]) {
    // 여행지 id를 키 값으로 가지고 여행지별 키워드 id 리스트를 value로 가지는 Map 객체 선언
    const keywordIdList = new Map<number, number[]>();
    // 여행지 id를 키 값으로 가지는 Map 객체 빈 배열로 초기화
    destinationIdList.map((id) => {
      keywordIdList.set(id, []);
    });

    await Promise.all(
      destinationIdList.map(async (id) => {
        // 여행지별 키워드 id 조회
        const keywordId =
          await this.mysqlService.findKeywordIdByDestinationId(id);
        // 반환 결과가 배열인 경우
        if (Array.isArray(keywordId)) {
          // 여행지와 연관된 키워드 id 추가
          keywordId.map((value) =>
            keywordIdList.get(id).push(value.keyword_id),
          );
        }
      }),
    );

    // Map 객체 -> 배열로 변환하여 반환
    return Array.from(keywordIdList);
  }

  // 여행지별 키워드 이름 리스트 담는 배열 반환하는 함수
  async getKeywordName(keywordIdList: number[][]) {
    // 여행지별 키워드 리스트 담는 배열
    let keywordList = [];

    // keywordIdList 순회
    for (const value of keywordIdList) {
      const keywords = await Promise.all(
        // 여행지별 키워드 담을 배열 생성
        value.map(async (id) => {
          const keyword = await this.mysqlService.findKeywordNameById(id);
          return keyword[0].name;
        }),
      );

      // 여행지별 키워드 배열 추가
      keywordList.push(keywords);
    }

    // 여행지별 키워드 리스트 담는 배열 반환
    return keywordList;
  }

  // 지역 기반 여행지 추천 API
  async getRegion(region: string) {
    // 유저가 선택한 지역을 공백 기준으로 분리하여 배열로 만듦
    const regionList = region.split(' ');

    // 사용자가 선택한 지역에 속해있는 여행지 리스트
    const destinationList = await this.getDestination(
      regionList[regionList.length - 1],
    );

    // 여행지 아이디 리스트
    const destinationIdList = destinationList.map(
      (destination) => destination.id,
    );

    // 여행지별 키워드 id 리스트
    const keywordIdList = await this.getKeywordId(destinationIdList);
    const keywordList = keywordIdList.map((keyword) => keyword[1]);

    // 여행지별 키워드 이름 리스트
    const keyword = await this.getKeywordName(keywordList);

    // response 데이터 배열(여행지 이름, 주소, 연관 키워드, 지역)
    let payload: {
      name: string;
      address: string;
      keyword: string[];
      region: string;
    }[] = [];

    // 사용자가 선택한 지역에 속해 있는 여행지 개수만큼 반복문 실행
    for (let i = 0; i < keywordIdList.length; i++) {
      payload.push({
        name: destinationList[i].name,
        address: destinationList[i].address,
        keyword: keyword[i],
        region,
      });
    }

    return { err: null, data: payload };
  }
}
