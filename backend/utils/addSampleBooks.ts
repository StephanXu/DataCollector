import request from 'request'
import { Book } from '../src/entity/books'

let LIBRARY_ID = 3
let TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYwNjkzNzc1MiwiZXhwIjoxNjA3MTk2OTUyfQ.v-76jGq5-hbFBX9h1okfxtFU6Dbwzrz09IvdU5QEjjw'
interface BookReq {
    title: string;
    author: string[];
    library: number;
    cover: string;
};

let titles = [
    "High Performance MySQL",
    "Oracle 9i & 10g编程艺术",
    "收获，不止Oracle",
    "高性能MySQL",
    "Redis设计与实现",
    "SQL必知必会",
    "PHP和MySQL Web开发(原书第4版)",
    "MySQL必知必会",
    "SQL反模式",
    "Hadoop: The Definitive Guide",
    "数据库系统概念",
    "NoSQL精粹",
    "SQL语言艺术",
    "SQL 必知必会（第3版）",
    "MySQL性能调优与架构设计",
    "MySQL技术内幕",
    "MongoDB",
    "Redis入门指南",
    "数据挖掘",
]

let authors = [
    "Jeremy D. Zawodny",
    "Thomas Kyte",
    "梁敬彬",
    "Baron Schwartz",
    "黄健宏 ",
    "福达",
    "Luke Welling",
    "福塔",
    "卡尔文",
    "Tom White ",
    "Abraham Silberschatz",
    "[美]Pramod J. Sadalage",
    "[美] StéphaneFaroult，P",
    "(英)Ben Forta",
    "简朝阳 ",
    "姜承尧 ",
    "Kristina Chodorow",
    "李子骅 ",
    "[加] Jiawei Han ",
]

let books: BookReq[] = titles.map((title, i) => {
    return <BookReq>{
        title,
        author: [authors[i]],
        library: LIBRARY_ID,
        cover: ''
    };
});

books.forEach(book => {
    request({
        url: `http://127.0.0.1:3000/api/library/${LIBRARY_ID}/book`,
        method: 'post',
        json: true,
        body: book,
        auth: {
            bearer: TOKEN
        }
    }, (err, res) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`Add book: ${book.title}\t by:${book.author[0]}`)
    });
})

