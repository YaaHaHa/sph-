<template>
  <div>
    <el-form
      :model="skuForm"
      label-width="100px"
      ref="ruleForm"
      :rules="ruleSku"
    >
      <el-form-item label="SPU名称">
        {{ spu.spuName }}
      </el-form-item>
      <el-form-item label="SKU名称" prop="skuName">
        <el-input v-model="skuForm.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)" prop="price">
        <el-input v-model.number="skuForm.price" type="number"></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)" prop="weight">
        <el-input v-model="skuForm.weight" type="number"></el-input>
      </el-form-item>
      <el-form-item label="规格描述" prop="skuDesc">
        <el-input type="textarea" v-model="skuForm.skuDesc" rows="4"></el-input>
      </el-form-item>
      <el-form-item label="平台属性" prop="attrValue">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item
            :label="attr.name"
            v-for="attr in attrList"
            :key="attr.id"
          >
            <el-select v-model="attr.attrIdNameId" placeholder="请输入">
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="attrValue in attr.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性" prop="saleAttr">
        <el-form :inline="true" label-width="100px">
          <el-form-item
            :label="saleAttr.saleAttrName"
            v-for="saleAttr in spuSaleAttrList"
            :key="saleAttr.id"
          >
            <!-- 同样收集到他自己身上 -->
            <el-select v-model="saleAttr.saleIdNameId" placeholder="请输入">
              <el-option
                :label="saleAttrValue.saleAttrvalueName"
                :value="`${saleAttr.id}:${saleAttrValue.id}`"
                v-for="saleAttrValue in saleAttr.spuSaleAttrValueList"
                :key="saleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <!-- 图片列表 -->
      <el-form-item label="图片列表" prop="imgList">
        <el-table
          :data="spuImageList"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column label="图片" width="width">
            <template slot-scope="{ row }">
              <img
                :src="row.imgUrl"
                alt="#"
                style="width: 100px; height: 100px"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="名称"
            width="width"
            prop="imgName"
          ></el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row }">
              <el-button
                v-if="row.isDefault === '0'"
                type="primary"
                @click="setDefault(row)"
                >设为默认</el-button
              >
              <el-tag v-else type="success">已默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancle">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    // 定义表单自定义效验规则
    let weightVali = (rule, value, callback) => {
      // rule就是来占个位
      //value就是你要校验的数据
      //callback代表校验成功还是失败的回调
      //如果传递了一个错误对象，那么就代表验证失败
      //如果没有传递任何参数就代表验证成功
      if (value < 0) {
        callback(new Error("不可小于零"));
      } else {
        callback();
      }
    };
    let priceVali = (rule, value, callback) => {
      if (typeof value !== "number") {
        callback(new Error("请输入数字"));
      } else if (value < 0) {
        callback(new Error("数值不合法"));
      }
      callback();
    };
    return {
      skuForm: {
        // 父组件传过来
        tmId: "",
        category3Id: "",
        spuId: "", //这个id是告诉后台给哪个spu添加sku
        //v-model直接收集
        price: "",
        weight: "",
        skuName: "",
        skuDesc: "",
        //要通过代码去收集的
        skuDefaultImg: "",
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   attrName: "string",
          //   id: 0,
          //   skuId: 0,
          //   valueId: 0,
          //   valueName: "string",
          // },
        ],
        skuImageList: [
          // {
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   spuImgId: 0,
          // },
        ],
        skuSaleAttrValueList: [
          // {
          //   id: 0,
          //   saleAttrId: 0,
          //   saleAttrName: "string",
          //   saleAttrValueId: 0,
          //   saleAttrValueName: "string",
          //   skuId: 0,
          //   spuId: 0,
          // },
        ],
      },
      spuName: "",

      spu: {}, // 直接接到拿过来的那一个spu详细信息，这里方便操作

      attrList: [], // 平台属性
      spuSaleAttrList: [], //销售属性列表
      spuImageList: [], // 指定SPU的id对应的图片列表，用户在这里面选择然后把被选中的放skuForm里面

      checkedImageList: [], //图片列表收集到被选中的图，这里面存储有被选择默认的那一张图片的信息

      ruleSku: {
        skuName: [
          {
            type: "string",
            required: true,
            message: "请输入sku名称",
            trigger: "blur",
          },
          { min: 3, max: 8, message: "长度在3到8个字符", trigger: "blur" },
        ],
        price: [
          {
            type: "number",
            required: true,
            message: "价格不能为空",
            trigger: "blur",
          },
          { validator: priceVali, trigger: "blur" },
        ],
        weight: [
          { required: false },
          { validator: weightVali, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 取消的回调
    cancle() {
      // 返回到父组件那里
      this.$emit("update:visible", false);
      // 重置数据
      this.resetData();
    },
    // 保存回去后不用再叫父组件请求spu列表了，没必要
    save() {
      this.$refs.ruleForm.validate(async (valid) => {
        if (valid) {
          // 从父组件那里拿数据
          let { tmId, category3Id, spuId } = this.spu;
          let { skuForm, spuSaleAttrList, checkedImageList, attrList } = this;

          skuForm.sputmId = tmId;
          skuForm.category3Id = category3Id;
          skuForm.spuId = spuId;
          // 整理图片列表
          // 要收集的结构
          // {
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   spuImgId: 0,
          // }
          // 当前的结构
          // {
          //    id:12,
          //    imgName:"7155bba4c363065f.jpg",
          //    imgUrl:"http://47.93.148.192:8080/group1/M00/00/02/rBHu8l-rgfWAVRWzAABUiOmA0ic932.jpg",
          //    isDefault:"0",
          //    spuId:3
          // }
          skuForm.skuImageList = checkedImageList.map((i) => {
            return {
              imgName: i.imgName,
              imgUrl: i.imgUrl,
              isDefault: i.isDefault,
              spuImgId: i.spuId,
            };
          });

          // 整理平台属性和销售属性
          // skuAttrValueList: [
          //   {
          //     attrId: 0,
          //     attrName: "string",
          //     id: 0,
          //     skuId: 0,
          //     valueId: 0,
          //     valueName: "string",
          //   },
          // ],
          // 这是收集平台属性recude方法传的默认值可以是数组
          skuForm.skuAttrValueList = attrList.reduce((newArr, current) => {
            if (current.attrIdNameId) {
              newArr.push({
                attrId: current.attrIdNameId.split(":")[0],
                valueId: current.attrIdNameId.split(":")[1],
              });
              return newArr;
            }
          }, []);
          // 这是收集销售属性的收集
          skuForm.skuSaleAttrValueList = spuSaleAttrList.reduce(
            (newArr, current) => {
              if (current.saleIdNameId) {
                // 函数也可以解构
                let [saleAttrId, saleAttrValueId] =
                  current.saleIdNameId.split(":");
                newArr.push({
                  saleAttrId,
                  saleAttrValueId,
                });
              }
              return newArr;
            },
            []
          );
          try {
            await this.$api.sku.addUpdate(skuForm);
            // 请求成功干啥
            this.$message.success("保存成功");
            // 数据重置
            this.resetData();
            // 调回到父组件
            this.$emit("update:visible", false);
          } catch (error) {
            this.$message.error("保存sku失败");
          }
        }
      });
    },
    resetData() {
      (this.skuForm = {
        // 父组件传过来
        tmId: "",
        category3Id: "",
        spuId: "", //这个id是告诉后台给哪个spu添加sku
        //v-model直接收集
        price: "",
        weight: "",
        skuName: "",
        skuDesc: "",
        //要通过代码去收集的
        skuDefaultImg: "",
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   attrName: "string",
          //   id: 0,
          //   skuId: 0,
          //   valueId: 0,
          //   valueName: "string",
          // },
        ],
        skuImageList: [
          // {
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   spuImgId: 0,
          // },
        ],
        skuSaleAttrValueList: [
          // {
          //   id: 0,
          //   saleAttrId: 0,
          //   saleAttrName: "string",
          //   saleAttrValueId: 0,
          //   saleAttrValueName: "string",
          //   skuId: 0,
          //   spuId: 0,
          // },
        ],
      }),
        (this.spuName = "");

      this.spu = {}; // 直接接到拿过来的那一个spu详细信息，这里方便操作

      this.attrList = []; // 平台属性
      this.spuSaleAttrList = []; //销售属性列表
      this.spuImageList = []; // 指定SPU的id对应的图片列表，用户在这里面选择然后把被选中的放skuForm里面

      this.checkedImageList = []; //图片列表收集到被选中的图，这里面存储有被选择默认的那一张图片的信息
    },
    async initAddSkuFormDate(row, category1Id, category2Id) {
      // 存起来
      this.spu = row;

      //根据三级分类id获取平台属性的分页列表
      //http://localhost:9529/dev-api/admin/product/attrInfoList/2/13/61
      const primise1 = this.$api.attr.getList(
        category1Id,
        category2Id,
        row.category3Id
      );

      //获取指定SPU的id对应的销售属性列表
      //http://localhost:9529/dev-api/admin/product/spuSaleAttrList/4
      const primise2 = this.$api.sku.getSpuSaleAttrList(row.id);

      //获取指定SPU的id对应的图片列表
      //http://localhost:9529/dev-api/admin/product/spuImageList/4
      const primise3 = this.$api.sku.getSpuImageList(row.id);

      const result = await Promise.all([primise1, primise2, primise3]);
      this.attrList = result[0].data;
      this.spuSaleAttrList = result[1].data;

      // 图片用为要处理默认，原始数据不行，要再设置一个属性

      let spuImageList = result[2].data;
      spuImageList.forEach((i) => (i.isDefault = "0"));
      this.spuImageList = spuImageList;
    },

    // 设置图片默认功能
    setDefault(row) {
      this.spuImageList.forEach((i) => (i.isDefault = "0"));
      row.isDefault = "1";
      // 然后收集到skuForm中
      this.skuForm.skuDefaultImg = row.imgUrl;
    },
    // 图片列表选中
    handleSelectionChange(checkedList) {
      this.checkedImageList = checkedList;
    },
  },
};
</script>

<style>
</style>