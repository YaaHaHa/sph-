<template>
  <div>
    <!-- label-width作用：如果不加这个属性，label就会独占一行，现在放在form上使所有的label都设定值 -->
    <!-- label-width也可以放item上，只不过那样要一个一个设置 -->
    <el-form ref="spuForm" :model="spuForm" label-width="100px">
      <el-form-item label="SPU名称">
        <el-input v-model="spuForm.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spuForm.tmId" placeholder="请选择品牌">
          <el-option
            v-for="t in tradeMarkList"
            :label="t.tmName"
            :value="t.id"
            :key="t.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          v-model="spuForm.description"
          rows="4"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <!-- 
            
          :file-list="spuImageList"指定要展示的是哪个图片数组，收集也是收集在这个数组当中
          【{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}】你的图片必须有这两个字段，但是我们没有
        -->
        <!-- action="/dev-api/admin/product/fileUpload"和上传品牌接口是一样的 -->
        <!-- :on-remove="handleRemove"删除成功的回调，里面收集图片列表 -->
        <!-- :on-success="handleSuccess"上传成功的回调，里面也得收集图片列表 -->
        <!-- :on-preview="handlePictureCardPreview"    预览大图，不需要写，人家本来就ok -->
        <el-upload
          list-type="picture-card"
          :file-list="spuImageList"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :on-preview="handlePictureCardPreview"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img :src="this.dialogImageUrl" width="100%" alt="#" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          v-model="spuTradeAttr"
          :placeholder="`还剩${unUseSaleList.length}未选`"
        >
          <!-- 这里展示的是未被选中的属性，为了方便收集value，直接用id与name结合起来 -->
          <el-option
            v-for="unSale in unUseSaleList"
            :key="unSale.id"
            :label="unSale.name"
            :value="`${unSale.id}:${unSale.name}`"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSaleAttr"
          :disabled="!spuTradeAttr"
          >添加销售属性</el-button
        >
        <el-table
          border
          style="width: 100%; margin: 20px 0"
          :data="spuForm.spuSaleAttrList"
        >
          <!-- prop="prop" -->
          <el-table-column label="序号" type="index" width="150" align="center">
          </el-table-column>
          <el-table-column label="属性名" width="width" prop="saleAttrName">
          </el-table-column>
          <el-table-column
            label="属性值名称列表"
            width="width"
            prop="saleAttrValueList"
          >
            <template slot-scope="{ row }">
              <!-- 加上closable就是可删除的 -->
              <el-tag
                v-for="(saleValue, index) in row.spuSaleAttrValueList"
                :key="saleValue.id"
                closable
                @close="row.spuSaleAttrValueList.splice(index, 1)"
                >``
                {{ saleValue.saleAttrvalueName }}
              </el-tag>
              <!-- 

                --------------重点-------------
              一个属性只能有一个input，所以挂在row上  
              row.inputVisible是代表是否是编辑模式，我们这次是把这个值定义在属性身上
              之前我们的平台属性是把这个值定义在属性值身上
              因为现在我们每个属性当中所有的属性值都不能有自己的编辑模式和查看模式，而是每个属性有一个
              之前我们是每个属性值都有自己的编辑模式和查看模式 -->
              <!-- row.inputValue代表输入input后，输入的数据收集到哪里，我们先把收集的数据保存到当前属性身上
              后面失去焦点或者回车的时候，再从当前这个属性身上去拿 -->
              <!--        重点理解               -->
              <el-input
                v-if="row.inputVisible"
                v-model="row.inputValue"
                placeholder="请输入属性值"
                ref="inp"
                @blur="getSaleAttrValue(row)"
                @keyup.enter.native="getSaleAttrValue(row)"
                size="small"
              ></el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="addAttrValueName(row)"
                >+ 添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`${row.saleAttrName}确定删除吗？`"
                @onConfirm="spuForm.spuSaleAttrList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>

      <!-- 
            
            :data="data" 
          -->
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  data() {
    return {
      spuForm: {
        // 这个里面初始化的所有数据，都是为了添加的时候收集所需要的
        //如果修改spu,是将获取到的spu详情数据，直接覆盖这里面的所有
        category3Id: 0,
        spuName: "",
        description: "",
        tmId: "",
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   isChecked: "string",
          //   saleAttrName: "string",
          //   saleAttrValueName: "string",
          //   spuId: 0,
          // },
          //   ],
          // },
        ],
      },
      category3Id: "",
      spuImageList: [], //获取图片列表到时候存在这个里面，最后再把这个图片列表整理完成放到spuForm里面

      tradeMarkList: [],
      saleAttrList: [], // 所有销售属性

      spuTradeAttr: "", // 属性复选框哪里收集的

      //这两个数据是上传图片用的
      dialogImageUrl: "",
      dialogVisible: false,
    };
  },
  computed: {
    //所有的销售属性除去自身的，剩余的销售属性列表
    // unUsedSpuSaleAttrList(){
    //   //从所有的销售属性列表当中去过滤，过滤出销售属性名称和自己的销售属性列表当中每个销售属性名称都不相同的
    //   return this.baseSaleAttrList.filter(baseSaleAttr => {
    //     //从baseSaleAttrList拿一项，就要去和自己已有的数组每个去对比，如果都不相等，就拿走，有相等就不要
    //     return this.spuForm.spuSaleAttrList.every(spuSaleAttr => {
    //       return baseSaleAttr.name !== spuSaleAttr.saleAttrName
    //     })
    //   })
    // },
    //所有的销售属性除去自身的，剩余的销售属性列表
    unUseSaleList() {
      return this.saleAttrList.filter((s) => {
        return this.spuForm.spuSaleAttrList.every(
          (sm) => sm.saleAttrName !== s.name
        );
      });
    },
  },
  methods: {
    //请求获取修改的初始化数据
    async initUpdateSpuFormData(spu) {
      //函数当中在发那4个请求
      //根据spuId获取spu的详情
      const result = await this.$api.spu.get(spu.id);
      if (result.code === 200) {
        this.spuForm = result.data;
      }

      //根据spuId获取spu的图片列表数据
      const spuImg = await this.$api.sku.getSpuImageList(spu.id);
      if (spuImg.code === 200) {
        // 处理一下才能被el-upload展示
        let spuImage = spuImg.data;
        spuImage.forEach((i) => {
          (i.name = i.imgName), (i.url = i.imgUrl);
        });
        this.spuImageList = spuImage;
      }

      //获取所有的品牌列表数据
      const tradeMark = await this.$api.trademark.getList();
      if (tradeMark.code === 200) {
        this.tradeMarkList = tradeMark.data.records;
      }

      //获取spu所有的销售属性数据
      const saleAttr = await this.$api.spu.getSaleAttrList();
      if (saleAttr.code === 200) {
        this.saleAttrList = saleAttr.data;
      }
    },

    // 当点击添加spu时在父里面调用这个
    async initAddSpuFormData(category3Id) {
      //获取所有的品牌列表数据
      this.category3Id = category3Id;
      const tradeMark = await this.$api.trademark.getList();
      if (tradeMark.code === 200) {
        this.tradeMarkList = tradeMark.data.records;
      }

      //获取spu所有的销售属性数据
      const saleAttr = await this.$api.spu.getSaleAttrList();
      if (saleAttr.code === 200) {
        this.saleAttrList = saleAttr.data;
      }
    },

    // 预览大图
    handlePictureCardPreview(file) {
      //file代表点击的图片文件，这个钩子会把被选中的那个图片选中
      // 然后我们控制dialog只展示图片
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 删除成功的回调
    handleRemove(file, fileList) {
      // console.log(file,fileList);
      // 他会帮我们在展览的图片列表中去掉被删除的那个，然后生成一个新数组在fileList中
      this.spuImageList = fileList;
    },
    // 上传成功的回调
    handleSuccess(response, file, fileList) {
      this.spuImageList = fileList;
    },
    // 添加销售属性
    addSaleAttr() {
      this.spuForm.spuSaleAttrList.push({
        baseSaleAttrId: this.spuTradeAttr.split(":")[0],
        saleAttrName: this.spuTradeAttr.split(":")[1],
        spuSaleAttrValueList: [],
      });
      this.spuTradeAttr = "";
    },
    // 展示属性值的输入框
    addAttrValueName(row) {
      // row是spuSaleAttrValueList[index]
      // spuSaleAttrValueList: [
      //     // {
      //     //   baseSaleAttrId: 0,
      //     //   id: 0,
      //     //   isChecked: "string",
      //     //   saleAttrName: "string",
      //     //   saleAttrValueName: "string",
      //     //   spuId: 0,
      //     // },
      //     //   ],
      // 添加进这一个属性，然后那边显示输入框
      this.$set(row, "inputVisible", true);
      // 添加被收集的属性值
      this.$set(row, "inputValue", "");
      // 获取焦点
      this.$nextTick(() => {
        this.$refs.inp.focus();
      });
    },

    // 属性值输入框失去焦点或敲回车
    getSaleAttrValue(row) {
      // 开始效验输入值的合法性
      let { baseSaleAttrId } = row;
      // 1.是否为空
      if (row.inputValue.trim() === "") {
        row.inputValue = "";
        return;
      }
      // console.log(row);
      // 2.是否已重复
      let isRepeat = row.spuSaleAttrValueList.some((i) => {
        // console.log(i.saleAttrvalueName,row.inputValue);
        return i.saleAttrvalueName === row.inputValue;
      });
      // console.log(isRepeat);
      if (isRepeat) {
        row.inputValue = "";
        this.$message.info("重复!");
        return;
      }

      let obj = {
        saleAttrvalueName: row.inputValue,
        baseSaleAttrId,
      };
      // 插入数据并且隐藏输入框
      row.spuSaleAttrValueList.push(obj);
      row.inputVisible = false;
      row.inputValue = "";
    },

    // 点击保存的回调
    async save() {
      // 收集整理数据，把spuImageList整理仅spuForm里面
      let { spuForm, spuImageList, category3Id } = this;
      spuForm.spuImageList = spuImageList;
      // 删掉saleAttrList中没用的属性
      spuForm.spuSaleAttrList.map((i) => {
        delete i.inputVisible;
        delete i.inputValue;
      });
      spuForm.category3Id = category3Id;
      // 发请求
      try {
        // 成功的回调
        await this.$api.spu.addUpdate(spuForm);
        this.$message.success("保存成功");
        // 成功了要返回到父组件spuForm那里
        this.$emit("update:visible", false);
        // 然后父亲那边要做事
        this.$emit("successback");
        // 然后这里数据重置
        this.resetData();
      } catch(error) {
        // 失败的回调
        this.$message.error("保存失败!");
      }
    },
    // 重置数据
    resetData() {
      (this.spuForm = {
        category3Id: 0,
        spuName: "",
        description: "",
        tmId: "",
        spuImageList: [],
        spuSaleAttrList: [],
      }),
        (this.category3Id = "");
      this.spuImageList = []; //获取图片列表到时候存在这个里面，最后再把这个图片列表整理完成放到spuForm里面

      this.tradeMarkList = [];
      this.saleAttrList = []; // 所有销售属性

      this.spuTradeAttr = ""; // 属性复选框哪里收集的

      //这两个数据是上传图片用的
      this.dialogImageUrl = "";
      this.dialogVisible = false;
    },

    // 点取消后的回调
    cancel() {
      // 隐藏spuForm
      this.$emit("update:visible", false);
      // 重置数据
      this.$emit("cancelback");
      this.resetData();
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>