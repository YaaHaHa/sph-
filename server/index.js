
/* 

    注意params与queru过来的数字格式，大多是string，要+param 转换成数字

*/


const express = require('express');
const fs = require('fs');

// 引入工具函数,计算分类列表
const categoryCom = require('./utils/categoryList')

// Multer 会添加一个 body 对象 以及 file 或 files 对象 到 express 的 request 对象中。 
// body 对象包含表单的文本域信息，file 或 files 对象包含对象表单上传的文件信息。
const multer = require('multer'); // 引入处理文件上传的中间件

const app = express();
// express 不能解析post请求体，需要安装中间件 body-parser
const bodyParser = require('body-parser');// parse application/x-www-form-urlencoded  （表单传输）
const { request, response } = require('express');
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json  （json传输）
app.use(bodyParser.json())


// 设置静态资源路径
app.use(express.static('assets'))

// 创一个变量存储上一次被上传图片的地址
var newLogoName;

// 存起来上一次的请求二级分类过来的一级分类id
var cate1;
var cate2;
var cate3;

// 存起来每次请求的一级二级三级分类，因为二级需在一级id中遍历找，三级...

var catel1 = [];   // 展暂时没用上
var catel2 = [];   // 2里面没剃干净，他有child
var catel3 = [];

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './assets/images/trademarklogo/')  //这里是图片存储路径，注意啊这里最后的那个/
    },
    filFilter: function (req, file, cb) {
        var typeArray = file.mimetype.split('/');
        var fileType = typeArray[1];
        if (fileType == 'jpg' || fileType == 'png') {
            cb(null, true);
        } else {
            cb(null, false)
        }
    },
    //fieldname 为文件域的名称 
    /*  
    filename 用于确定文件夹中的文件名的确定。 如果没有设置 filename，每个文件将设置为一个随机文件名，并且是没有扩展名的。
     注意: Multer 不会为你添加任何扩展名，你的程序应该返回一个完整的文件名。 
     每个函数都传递了请求对象 (req) 和一些关于这个文件的信息 (file)，有助于你的决定。
     这里的file.filename是保存在 destination 中的文件名
     */
    filename: function (req, file, cb) {
        // 获取被上传文件的扩展名
        var nameArray = file.originalname.split('.');
        var type = nameArray[nameArray.length - 1];
        // 设置回调的内容,参数1：错误信息，参数2：图片新的名字
        cb(null, file.fieldname + '_' + Date.now() + '.' + type)
    }
});
var upload = multer({
    storage: storage
});

// 不同用户的token
const tokens = {
    admin: {
        token: 'admin-token'
    },
    editor: {
        token: 'editor-token'
    }
}

// 用户的信息
const users = {
    'admin-token': {
        roles: ['admin'],
        introduction: 'I am a super administrator',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        name: 'Super Admin',
        routes: ["Product", "Trademark", "Attr", "Sku", "Spu", "Acl", "User", "Role", "RoleAuth", "Menu"],
        roles:['管理员1'],
        buttons: []
    },
    'editor-token': {
        roles: ['editor'],
        introduction: 'I am an editor',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        name: 'Normal Editor',
        routes: ["Product", "Trademark", "Attr"],
        roles:[],
        buttons: []
    }
}

// 登录成功返回token
app.post('/api/user/login', (request, response) => {
    const { username } = request.body;
    const token = tokens[username]
    if (token) {
        response.send({
            code: 20000,
            data: token
        })
    } else {
        response.send({
            code: 60204,
            message: 'Account and password are incorrect.'
        })
    }

})


// 获取用户信息
app.get('/api/user/info', (request, response) => {
    // 从请求那里拿到要获取的用户相关信息，找到关于那个用户的数据返回回去
    const { token } = request.query;
    const info = users[token];
    if (info) {
        response.send({
            code: 20000,
            data: info
        })
    } else {
        response.send({
            code: 50008,
            message: 'Login failed, unable to get user details.'
        })
    }

})


// 用户退出登录的请求
app.post('/api/user/logout', (request, response) => {
    response.send({
        code: 20000,
        data: 'success'
    })
})


// 获取所有品牌列表
app.get('/api/admin/product/baseTrademark/getTrademarkList', (request, response) => {
    fs.readFile('./assets/data/trademark.json', (err, data) => {
        if (err) throw err;
        // 从文件中读取数据
        const trademarkInfo = JSON.parse(data.toString()).records;
        response.send({
            code: 200,
            message: '成功',
            data: {
                "records": trademarkInfo,
                "total": trademarkInfo.length,

            },
            "ok": true
        })
    })

})

// 根据页码与尺寸
app.get('/api/admin/product/baseTrademark/:page/:limit', (request, response) => {
    const { page, limit } = request.params;
    fs.readFile('./assets/data/trademark.json', (err, data) => {
        if (err) throw err;
        // 从文件中读取数据
        const trademarkInfo = JSON.parse(data.toString());
        // 计算出来需要显示的内容
        const showList = trademarkInfo.records.slice((page - 1) * limit, page * limit)
        let lg = trademarkInfo.records.length;
        response.send({
            code: 200,
            message: '成功',
            data: {
                "records": showList,
                "total": lg,
                "size": limit,
                "current": page,
                "searchCount": true,
                "pages": Math.ceil(lg / limit)

            },
            "ok": true
        })
    })

})

// 获取分页品牌列表
/* app.get('/api/admin/product/baseTrademark/getTrademarkList', (request, response) => {

    fs.readFile('./assets/data/trademark.json', (err, data) => {
        if (err) throw err;
        // 从文件中读取数据
        const trademarkInfo = JSON.parse(data.toString());
        // 计算出来需要显示的内容
        response.send({
            code: 200,
            message: '成功',
            data: {
                "records": showList,
                "total": lg,
                "size": 3,
                "current": 3,
                "searchCount": true,
                "pages": Math.ceil(lg/limit)

            },
            "ok": true
        })
    })
})
 */
// 用户上传品牌logo，发送到服务器，然后服务器存下来，并把实际路径返回给前端
// .single(fieldname)
// 接受一个以 fieldname 命名的文件。这个文件的信息保存在 request.file
// sigle上传单个文件，file是前端上传图像的input标签的name值
app.post('/api/admin/product/fileUpload', upload.single('file'), (request, response) => {
    // 新logo的路径
    newLogoName = `http://localhost:8000/images/trademarklogo/${request.file.filename}`
    console.log('upload');
    // 这里的request.file.filaname是保存下来的文件的全名
    var url = newLogoName
    response.send({
        "code": 200,
        "logoUrl": url
    })
})

// 更新品牌
app.put('/api/admin/product/baseTrademark/update', (request, response) => {
    let { id, tmName, logoUrl } = request.body;
    fs.readFile('./assets/data/trademark.json', (err, data) => {
        if (err) throw err;
        const trademarkInfo = JSON.parse(data.toString());
        const { records } = trademarkInfo;
        try {
            records.forEach((e) => {
                // 遍历找到那个id后修改更新然后重新写入，然后跳出循环
                if (e.id === id) {
                    e.tmName = tmName;
                    e.logoUrl = logoUrl;
                    fs.writeFile('./assets/data/trademark.json', JSON.stringify(trademarkInfo), (err) => {
                        if (err) throw err;
                        // 抛出指定错误跳出遍历
                        response.send({
                            "code": 200,
                            "message": "ok"
                        })
                    })
                    throw new Error('UpdateSuccess')
                }
            });
        } catch (error) {       // 如果捕捉到不是指定错误，也就是说不是我们要跳出循环的错误，再另处理
            if (error.message !== 'UpdateSuccess') throw error;
        }
    })
})

// 添加新品牌
app.post('/api/admin/product/baseTrademark/save', (request, response) => {
    console.log("添加品牌接口被访问");
    // let {tmName,logoUrl} = request.body.trademark;   请求过来就是一个对象,trademark是在前端那边保存请求数据的名字
    let { tmName, logoUrl } = request.body;

    fs.readFile('./assets/data/trademark.json', (err, data) => {
        if (err) throw err;
        // 从文件中读取数据，把图片路径改成服务器的真实路径，然后存起来
        const trademarkInfo = JSON.parse(data.toString());
        const { records } = trademarkInfo;
        records.push({
            "id": Date.now(),
            "tmName": tmName,
            "logoUrl": logoUrl
        });
        fs.writeFile('./assets/data/trademark.json', JSON.stringify(trademarkInfo), (err) => {
            if (err) throw err;
            response.send({
                "code": 200,
                "message": "ok"
            })
        })
    })
})

// 删除品牌
// DELETE /admin/product/baseTrademark/remove/{id}  //根据id删除某个品牌
// 删除BaseTrademark
app.delete('/api/admin/product/baseTrademark/remove/:id', (request, response) => {
    // 请求解析出来的是字符串
    let id = +request.params.id;
    console.log(`delete${id}`);
    fs.readFile('./assets/data/trademark.json', (err, data) => {
        if (err) throw err;
        const trademarkList = JSON.parse(data.toString())
        const { records } = trademarkList;
        try {
            records.forEach((t, index) => {
                if (t.id === id) {
                    // 找到那一个然后删掉
                    records.splice(index, 1);
                    fs.writeFile('./assets/data/trademark.json', JSON.stringify(trademarkList), (err) => {
                        if (err) throw err;
                        response.send({
                            "code": 200,
                            "message": "ok"
                        })
                    })
                    throw new Error('deleteSuccess');

                }
            })

        } catch (error) {
            if (error.message !== 'deleteSuccess') throw error;

        }
    })
})

// 请求一级分类列表
app.get('/api/admin/product/getCategory1', (request, response) => {
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
        // 存起来，方便查二级用
        response.send({
            "code": 200,
            data: categorylist1
        })
    })
})


// 请求二级分类
app.get('/api/admin/product/getCategory2/:category1Id', (request, response) => {
    const { category1Id } = request.params;
    cate1 = category1Id;
    fs.readFile('./assets/data/CategoryLIst.json', (err, data) => {
        if (err) throw err;
        const categorylist = JSON.parse(data.toString()).data;
        // 遍历一下把文件中找到分类一中的第二分类并 存到数组中
        const categorylist2 = [];
        // 遍历数据把类别1搞出来
        categorylist.forEach((c) => {
            if (c.id == category1Id) {
                // 再遍历child数组，把二级中的三级分类过滤掉
                c.categoryChild.forEach((c2) => {
                    categorylist2.push({
                        id: c2.id,
                        name: c2.name
                    })
                })
                // 存起来方便三级用
                catel2 = c.categoryChild;
                response.send({
                    "code": 200,
                    data: categorylist2
                })
            }
        })
    })
})


// 请求三级分类
app.get('/api/admin/product/getCategory3/:category2Id?', (request, response) => {
    const { category2Id } = request.params;
    // 把二级id更新一下
    cate2 = category2Id;
    catel2.forEach((c) => {
        if (c.id == category2Id) {
            catel3 = c.categoryChild
            response.send({
                "code": 200,
                data: catel3
            })
        }
    })
})

//根据选中三级分类后获取平台属性列表
// GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
// attrInfoList
app.get('/api/admin/product/attrInfoList/:category1Id?/:category2Id/:category3Id?', (request, response) => {
    let { category1Id, category2Id, category3Id } = request.params;
    cate3 = category3Id;
    fs.readFile('./assets/data/CategoryLIst.json', (err, data) => {
        if (err) throw err;
        let ca = JSON.parse(data.toString()).data;
        let cat1 = ca.find(e => e.id === +category1Id)

        let cat2 = cat1.categoryChild.find(e => e.id === +category2Id);
        let cat3 = cat2.categoryChild;
        response.send({
            "code": 200,
            "data": cat3
        })
    })
    // 因为在上面已经把查到的catel3放在服务器全局了，所以，直接用


})


// 添加或者修改属性
// POST /admin/product/saveAttrInfo
// {
//   "attrName": "string",
//   "attrValueList": [
//     {
//       "attrId": 0,
//       "id": 0,
//       "valueName": "string"
//     }
//   ],
//   "categoryId": 0,
//   "categoryLevel": 0,
//   "id": 0
// }
app.post('/api/admin/product/saveAttrInfo', (request, response) => {
    console.log('添加或者修改属性被访问');
    let attrFrom = request.body;

    console.log(attrFrom);
    fs.readFile('./assets/data/CategoryLIst.json', (err, data) => {
        if (err) throw err;
        // 通过地址引用传递，这些数组不过是地址，先读出来保存到服务器然后操作，然后再把改好的写回去
        let ca = JSON.parse(data.toString()).data;
        let cat1 = ca.find(e => e.id === +cate1)

        let cat2 = cat1.categoryChild.find(e => e.id === +cate2);
        let cat3 = cat2.categoryChild;
        // console.log(cat3);
        try {
            cat3.forEach((c, index) => {
                let attrId = Date.now()
                if (attrFrom.id == 0) {   // id为0说明是添加的，不为0说明是修改的
                    attrFrom.attrValueList.forEach((v, index) => {   // 给新添加的属性的属性值添加id
                        v.attrId = attrId;
                        v.id = Date.now() + 1 + index;
                    })
                    cat3.push({
                        ...attrFrom,
                        id: attrId
                    })

                    throw new Error('addNewAttr')
                } else if (c.id == attrFrom.id) {
                    attrFrom.attrValueList.forEach((v, index) => {   // 给新添加的属性的属性值添加id
                        v.attrId = attrId;
                        v.id = Date.now() + 1 + index;
                    })
                    console.log(cat3[index]);
                    cat3[index] = attrFrom;
                    throw new Error('updateAttr')
                }
            })
        } catch (error) {
            if (error.message != 'addNewAttr' && error.message != 'updateAttr') throw error;
            // console.log(cat3);
            // 如果没什么问题就写入
            fs.writeFile('./assets/data/CategoryLIst.json', JSON.stringify({ data: ca }), (err) => {
                if (err) throw err;
                response.send({
                    "code": 200,
                    "message": "ok"
                })
            })
        }
    })

})


// 删除属性/api/admin/product/deleteAttr/${attrId}
app.delete('/api/admin/product/deleteAttr/:attrId?', (request, response) => {
    // 隐式转换一下成数字
    let attrId = +request.params.attrId;
    // console.log(+attrId);
    fs.readFile('./assets/data/CategoryLIst.json', (err, data) => {
        if (err) throw err;
        // 通过地址引用传递，这些数组不过是地址，先读出来保存到服务器然后操作，然后再把改好的写回去
        let ca = JSON.parse(data.toString()).data;
        let cat1 = ca.find(e => e.id === +cate1)

        let cat2 = cat1.categoryChild.find(e => e.id === +cate2);
        let cat3 = cat2.categoryChild;
        console.log(attrId);
        // 过滤掉传过来的那个，filter创建新数组，这里cat3就不再指向原来的那一块了，他和上一层之间的联系也断了
        // cat3 = cat3.filter(c => c.id != +attrId);

        // 找到那个索引，还在原来的那一片内存中，就继续利用引用
        let deleteIndex = cat3.findIndex(c => c.id === attrId)
        console.log(deleteIndex);
        cat3.splice(deleteIndex, 1);
        // console.log(cat3);
        // 如果没什么问题就写入
        fs.writeFile('./assets/data/CategoryLIst.json', JSON.stringify({ data: ca }), (err) => {
            if (err) throw err;
            response.send({
                "code": 200,
                "message": "ok"
            })
        })
    })

})

/* 
获取spu的分页列表数据
GET /admin/productp/{page}/{limit}      注意是productp，防止被覆盖
  query参数: category3Id
*/
app.get('/api/admin/productp/:page/:limit', (request, response) => {
    let page = +request.params.page;
    let limit = +request.params.limit;
    // console.log(page, limit);
    let category3Id = +request.query.category3Id;
    const records = [
        {
            "category3Id": category3Id,
            "description": "带带带世界",
            "id": 4,
            "spuImageList": null,
            "spuName": "带带带世界",
            "spuSaleAttrList": null,
            "tmId": 3
        },
        {
            "category3Id": category3Id,
            "description": "带带晓世界",
            "id": 5,
            "spuImageList": null,
            "spuName": "带带晓世界",
            "spuSaleAttrList": null,
            "tmId": 4
        },
        {
            "category3Id": category3Id,
            "description": "带带那世界",
            "id": 6,
            "spuImageList": null,
            "spuName": "带带那世界",
            "spuSaleAttrList": null,
            "tmId": 5
        },
        {
            "category3Id": category3Id,
            "description": "芜湖传说",
            "id": 7,
            "spuImageList": null,
            "spuName": "芜湖传说",
            "spuSaleAttrList": null,
            "tmId": 6
        },
        {
            "category3Id": category3Id,
            "description": "八嘎呀路",
            "id": 8,
            "spuImageList": null,
            "spuName": "八嘎呀路",
            "spuSaleAttrList": null,
            "tmId": 7
        },
        {
            "category3Id": category3Id,
            "description": "私密马赛",
            "id": 9,
            "spuImageList": null,
            "spuName": "私密马赛",
            "spuSaleAttrList": null,
            "tmId": 8
        },
        {
            "category3Id": category3Id,
            "description": "哒哒哒",
            "id": 10,
            "spuImageList": null,
            "spuName": "哒哒哒",
            "spuSaleAttrList": null,
            "tmId": 9
        },
    ].slice((page - 1) * limit, page * limit);
    // console.log(page, limit, category3Id);
    response.send({
        "code": 200,
        "data": {
            records,
            "total": 7,
            page,
            limit,
        }
    })
})

/* 
根据id获取SPU详情信息
GET /admin/product/getSpuById/{spuId}
spuList: 包含多个spu简单信息的数组，数组里面放了很多spu对象，但是每个spu对象里面信息不全
spuInfo: 包含一个spu详细信息的对象，信息比较详细的
*/
app.get('/api/admin/product/getSpuById/:spuId', (request, response) => {
    let spuId = +request.params.spuId;
    // console.log(spuId);
    response.send({
        code: 200,
        data: {
            category3Id: spuId,
            description: "带带带世界",
            id: 4,
            spuImageList: null,
            spuName: "带带带世界",
            spuSaleAttrList: [
                {
                    id: 7,
                    spuId: spuId,
                    baseSaleAttrId: 1,
                    saleAttrName: "颜色",
                    spuSaleAttrValueList: [
                        { id: 99, saleAttrvalueName: "蓝色" },
                        { id: 98, saleAttrvalueName: "红色" },

                    ],
                    tmId: 1
                },
                {
                    id: 8,
                    spuId: spuId,
                    baseSaleAttrId: 2,
                    saleAttrName: "内存",
                    spuSaleAttrValueList: [
                        { id: 999, saleAttrvalueName: '99G' },
                        { id: 998, saleAttrvalueName: '999G' },
                    ],
                    tmId: 2
                },
            ]

        },
        ok: true
    })
})

/* 
获取指定SPU的id对应的图片列表
GET /admin/product/spuImageList/{spuId}
*/
app.get('/api/admin/product/spuImageList/:spuId', (request, response) => {
    let spuId = +request.params.spuId;
    response.send({
        code: 200,
        data: [
            {
                id: 19,
                imgName: '开心超人.jpeg',
                imgUrl: "http://localhost:8000/images/spuImage/开心超人.jpeg",
                spuId: 4
            },
            {
                id: 20,
                imgName: '小心超人.jpeg',
                imgUrl: "http://localhost:8000/images/spuImage/小心超人.jpeg",
                spuId: 4
            },
            {
                id: 21,
                imgName: '开心超人.jpeg',
                imgUrl: "http://localhost:8000/images/spuImage/开心超人.jpeg",
                spuId: 4
            },
            {
                id: 22,
                imgName: '小心超人.jpeg',
                imgUrl: "http://localhost:8000/images/spuImage/小心超人.jpeg",
                spuId: 4
            },
            {
                id: 23,
                imgName: '开心超人.jpeg',
                imgUrl: "http://localhost:8000/images/spuImage/开心超人.jpeg",
                spuId: 4
            },

        ],
        message: '成功',
        ok: true

    })
})


/* 
获取所有的spu销售属性列表
GET /admin/product/baseSaleAttrList
*/
app.get('/api/admin/product/baseSaleAttrList', (request, response) => {
    response.send({
        code: 200,
        data: [
            {
                id: 1,
                name: "颜色",
            },
            {
                id: 2,
                name: "版本"
            },
            {
                id: 3,
                name: '尺寸'
            },
            {
                id: 4,
                name: "类别"
            }
        ],
        message: '成功',
        ok: true
    })
})

// 添加SPU详情信息
// POST /admin/product/saveSpuInfo
// POST /admin/product/updateSpuInfo
app.post('/api/admin/product/saveSpuInfo', (request, response) => {
    let spuInfo = request.body;
    response.send({
        code: 200,
        data: spuInfo
    })
})
app.post('/api/admin/product/updateSpuInfo', (request, response) => {
    let spuInfo = request.body;
    response.send({
        code: 200,
        data: spuInfo
    })
})

/* 
删除指定的SPU
DELETE /admin/product/deleteSpu/{spuId}
*/
app.delete('/api/admin/product/deleteSpu/:spuId', (request, response) => {
    response.send({
        code: 200,
        message: "ok"
    })
})


/* 
所有的spu销售属性列表：  所有的销售属性 [颜色   版本   套装]
某个spu的销售属性列表：  [颜色、套装]
获取指定SPU的id对应的销售属性列表
GET /admin/product/spuSaleAttrList/{spuId}
*/
app.get('/api/admin/product/spuSaleAttrList/:spuId', (request, response) => {
    let spuId = request.params.spuId;
    response.send({
        code: 200,
        data: [
            {
                baseSaleAttrId: 1,
                id: 141,
                saleAttrName: '颜色',
                spuId,
                spuSaleAttrValueList: [
                    {
                        baseSaleAttrId: 1,
                        id: 99,
                        isChecked: null,
                        saleAttrName: '颜色',
                        saleAttrvalueName: '蓝色',
                        spuId
                    },
                    {
                        baseSaleAttrId: 1,
                        id: 98,
                        isChecked: null,
                        saleAttrName: '颜色',
                        saleAttrvalueName: '红色',
                        spuId
                    }

                ]
            },
            {
                baseSaleAttrId: 2,
                id: 142,
                saleAttrName: '内存',
                spuId,
                spuSaleAttrValueList: [
                    {
                        baseSaleAttrId: 2,
                        id: 999,
                        isChecked: null,
                        saleAttrName: '内存',
                        saleAttrvalueName: '99G',
                        spuId
                    },
                    {
                        baseSaleAttrId: 1,
                        id: 998,
                        isChecked: null,
                        saleAttrName: '内存',
                        saleAttrvalueName: '999G',
                        spuId
                    }

                ]
            }

        ]
    })
})
/* 
保存SKU
POST /admin/product/saveSkuInfo
POST /admin/product/updateSkuInfo
*/
app.post('/api/admin/product/saveSkuInfo', (request, response) => {
    let skuInfo = request.body;
    response.send({
        code: 200,
        data: skuInfo,
        message: 'ok'
    })
})
app.post('/api/admin/product/updateSkuInfo', (request, response) => {
    let skuInfo = request.body;
    response.send({
        code: 200,
        data: skuInfo,
        message: 'ok'
    })
})

/* 
根据指定的SPU的id查询所有对应的SKU的列表
GET /admin/product/findBySpuId/{spuId}
*/
app.get('/api/admin/product/findBySpuId/:spuId', (request, response) => {
    let spuId = request.spuId;
    response.send({
        code: 200,
        data: [
            {
                id: 111,
                skuName: '可怜巴巴',
                price: 999,
                weight: 2,
                defaultImg: 'http://localhost:8000/images/可怜巴巴.jpg'
            },
            {
                id: 112,
                skuName: '哭了',
                price: 998,
                weight: 3,
                defaultImg: 'http://localhost:8000/images/哭了.jpg'
            },
            {
                id: 113,
                skuName: '大哭',
                price: 999,
                weight: 2,
                defaultImg: 'http://localhost:8000/images/大哭.jpg'
            },
        ],
        message: 'ok'
    })
})

// 保存新角色
app.post('/api/admin/acl/role/save', (request, response) => {
    let roleData = request.body;
    response.send({
        code: 200,
        data: roleData,
        message: 'ok'
    })
})
// 删除某个角色
app.delete('/api/admin/acl/role/remove/:id', (request, response) => {
    let rmId = request.params.id;
    response.send({
        code: 200,
        data: `被删的是${rmId}`,
        message: 'ok'
    })
})

// 批量删除角色
app.delete('/api/admin/acl/role/batchRemove', (request, response) => {
    let body = request.body;
    response.send({
        code: 200,
        data: body,
        message: 'ok'
    })
})



// 获取一个用户的所有权限列表
app.get('/api/admin/acl/role/toAssign/:roleId', (request, response) => {
    let roleId = request.params.roleId;
    fs.readFile('./assets/data/roleAuth.json',(err,data)=>{
        if (err) throw err;
        let roleAuth = JSON.parse(data.toString()).data;
        response.send({
            code: 200,
            data: roleAuth,
            roleId
        })
    })
})

// 保存一个新角色
app.post('/api/admin/acl/permission/doAssign',(request,response)=>{
    let role = request.body;
    response.send({
        code:200,
        data:role,
        message:'ok'
    })
})

// 获取角色分页列表
// admin/acl/role/${page}/${limit}
app.get('/api/admin/acl/role/:page/:limit', (request, response) => {
    let { page, limit } = request.params;
    let { roleName } = request.query
    fs.readFile('./assets/data/roles.json', (err, data) => {
        if (err) throw err;
        let roles = JSON.parse(data.toString());

        response.send({
            code: 200,
            items: roles.data,
            total: 80,
            page,
            limit,
            roleName
        })
    })
})
app.listen(8000, () => {
    console.log('8000端口监听中！');
})