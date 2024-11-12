import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class MySqlService {
  private pool: mysql.Pool;

  constructor() {
    // db 연결 설정
    this.pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3306,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: 'test1',
    });
  }

  // 키워드 id 찾는 쿼리
  async findKeywordId(keyword: string) {
    const sql = `SELECT id FROM keyword WHERE name = "${keyword}"`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }

  // 여행지 찾는 쿼리
  async findDestination(id: number) {
    const sql = `SELECT name, address, city_id FROM destination WHERE id = "${id}"`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }

  // 리전 조회하는 쿼리
  async getRegion(id: number) {
    const sql = `SELECT co.name as country, ci.name as city FROM cities as ci JOIN countries as co ON ci.country_id = co.id and ci.country_id = "${id}"`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }

  // query 실행하는 method
  async query(sql: string, params: any[] = []) {
    // MySQL 쿼리 실행하고 결과 반환
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}
