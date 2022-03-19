const fs = require('fs')
module.exports = {
    // 获取分类列表1
    getCategoryList1() {
        fs.readFile('./assets/data/CategoryLIst.json', (err, data) => {
            if (err) throw err;
            const categorylist = JSON.parse(data.toString()).data;
            // 遍历一下把文件中每一个大类中的第一分类存到数组中
            const categorylist1 = [];
            // 遍历数据把类别1搞出来
            categorylist.map((c) => {
                categorylist1.push({
                    name: c.name,
                    id: c.id
                });
            })
            return categorylist1;
        })
    },

    // 获取分类列表2，要求传入分类1列表
    getCategoryList2(categorylist1=[],category1Id) {
        const categorylist2 =[];
        categorylist1.forEach((c) => {
            if (c.id == category1Id) {
                // 再遍历child数组，把二级中的三级分类过滤掉
                c.categoryChild.forEach((c2) => {
                    categorylist2.push({
                        id: c2.id,
                        name: c2.name
                    })
                })
            }
        })
        return categorylist2;
    },


}