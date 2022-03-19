<template>
  <div>
    <el-card>
      <!-- 这个三级目录出现的目的是让用户选择类别，当最后一个id集齐后，这里发请求，不是CategorySelector，是此组件-->
      <CategorySelector @collectId="collectId" :isShowAdd="isShowAdd" />
    </el-card>
    <el-card style="margin-top: 20px">
      <!-- 这个el-card中有三个区域，一个区域展示列表，一个区域添加修改SPU，一个区域添加sku -->
      <!-- 这里用组件处理 -->
      <div v-show="!isShowSkuForm === true && !isShowSpuForm === true">
        <el-button
          type="primary"
          @click="addSpuForm"
          :disabled="spuList.length === 0"
          >添加SPU属性</el-button
        >
        <!-- :data="data" -->
        <el-table border style="width: 100%" :data="spuList">
          <el-table-column label="序号" type="index" width="80">
          </el-table-column>
          <el-table-column label="SPU名称" width="width" prop="spuName">
          </el-table-column>
          <el-table-column label="SPU描述" width="width" prop="description">
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row }">
              <HintButton
                type="success"
                title="添加sku"
                icon="el-icon-plus"
                size="mini"
                @click="showSkuForm(row)"
              ></HintButton>
              <HintButton
                type="warning"
                title="修改spu"
                icon="el-icon-edit"
                size="mini"
                @click="showSpuForm(row)"
              ></HintButton>
              <HintButton
                type="info"
                title="查看sku列表"
                icon="el-icon-info"
                size="mini"
                @click="showSkuList(row)"
              ></HintButton>
              <el-popconfirm
                :title="`确认删除${row.spuName}吗？`"
                @onConfirm="deleteSpu(row)"
              >
                <HintButton
                  type="danger"
                  title="删除"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align: center"
          @current-change="getSpuList"
          @size-change="handleSizeChange"
          :current-page="page"
          :page-sizes="[3, 5, 7]"
          :page-size="limit"
          layout="  prev, pager, next, ->,sizes,jumper,total"
          :total="total"
        >
        </el-pagination>
      </div>
      <SpuForm
        v-show="isShowSpuForm"
        ref="spuForm"
        :visible.sync="isShowSpuForm"
        @successback="successback"
        @cancelback="cancelback"
      />
      <SkuForm v-show="isShowSkuForm" ref="sku" :visible.sync="isShowSkuForm" />

      <el-dialog
        :title="`${spu.spuName} => SKU列表`"
        :visible.sync="isShowDialog"
        :before-close="dialogBeforeClose"
      >
        <el-table :data="skuList" border style="100%">
          <el-table-column prop="skuName" label="名称" width="150">
          </el-table-column>
          <el-table-column prop="price" label="价格" width="150">
          </el-table-column>
          <el-table-column prop="weight" label="重量" width="width">
          </el-table-column>
          <el-table-column label="默认图片" width="200">
            <template slot-scope="{ row }">
              <img
                :src="row.defaultImg"
                alt="#"
                style="weight: 100px; height: 100px"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import SpuForm from "../components/SpuForm.vue";
import SkuForm from "../components/SkuForm.vue";
export default {
  name: "SpuList",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",

      spuList: [], // spu列表
      isShowAdd: false, // 这个只是用来控制三级联动那个是否显示，用watch监视然后动态修改的，就不用在一个一个改了

      // 下面这两个数据才是控制三个页面轮流展示的变量
      isShowSpuForm: false,
      isShowSkuForm: false,

      spu: {}, // 在显示Dialog的时候要从这里面拿东西
      skuList: [], //  这个是用来展示的sku列表
      isShowDialog: false,
      page: 1,
      limit: 3,
      total: 0,
    };
  },
  // 注册spu表单与sku表单
  components: {
    SpuForm,
    SkuForm,
  },
  methods: {
    // 展示Dialog
    async showSkuList(row) {
      // 控制isShowDialog决定是否显示
      this.spu = row; // 这一步主要的目的是让Dialog中的title可以拿到spuName显示
      this.isShowDialog = true;
      try {
        const result = await this.$api.sku.getListBySpuId(row.id);
        this.skuList = result.data;
      } catch (error) {
        this.$message.error("获取sku列表失败");
      }
    },
    // Dialog关闭前的回调
    dialogBeforeClose() {
      this.isShowDialog = false;
      this.spu = {};
      this.skuList = [];
    },
    // 删除spu的回调
    async deleteSpu(row) {
      try {
        await this.$api.spu.remove(row.id);
        this.$message.success("删除成功");
        this.getSpuList(this.spuList.length > 1 ? this.page : this.page - 1);
        // 三级联动开启
        this.isShowAdd = false;
      } catch (error) {
        this.$message.error("删除失败");
      }
    },
    // spuForm点取消后的回调
    cancelback() {
      this.flag = null;
      // 三级联动开启
      this.isShowAdd = false;
    },
    // spuForm成功保存后的回调
    successback() {
      // 判断是添加还是修改，因为在修改的操作中给this添加了flag
      if (this.flag) {
        this.getSpuList(this.page);
      } else {
        this.getSpuList();
      }
      // 重新获取完数据后，要重置标识数据
      this.flag = null;
    },
    // 点击添加spu，不用往spuForm传东西
    addSpuForm() {
      this.isShowSpuForm = true;
      this.isShowSkuForm = false;

      // 初始化spuForm
      this.$refs.spuForm.initAddSpuFormData(this.category3Id);
    },

    // 展示修改Spu表单，isShowSpuForm为true，isShowSkuForm为false
    showSpuForm(spu) {
      this.isShowSpuForm = true;
      this.isShowSkuForm = false;

      // 如果是修改的，就把id拿到data里
      this.flag = spu.id;
      // 初始化修改的spuForm
      this.$refs.spuForm.initUpdateSpuFormData(spu);
    },

    // 展示sku表单
    showSkuForm(row) {
      this.isShowSkuForm = true;
      this.isShowSpuForm = false;

      // 与进入spu界面一样，要发请求
      this.$refs.sku.initAddSkuFormDate(
        row,
        this.category1Id,
        this.category2Id
      );
    },

    // 改变显示的limit，这个方法传到了Pagination里面使用，在那里传的参数
    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },
    // 收集id给CategorySelector去搜索，当三级分类id都过来以后才发请求作展示
    collectId({ id, lever }) {
      if (lever == 1) {
        this.category1Id = id;
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
      } else if (lever == 2) {
        this.category2Id = id;
        this.category3Id = "";
        this.spuList = [];
      } else if (lever == 3) {
        this.category3Id = id;
        this.getSpuList();
      }
    },
    // 当一二三级id过来以后发请求
    async getSpuList(page = 1) {
      this.page = page;
      const result = await this.$api.spu.getList(
        this.page,
        this.limit,
        this.category3Id
      );
      if (result.code === 200) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },
  },
  // 处理三级联动,为什么要处理三级联动
  watch: {
    isShowSpuForm(newV, oldV) {
      this.isShowAdd = newV;
    },
    isShowSkuForm(newV, oldV) {
      this.isShowAdd = newV;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>