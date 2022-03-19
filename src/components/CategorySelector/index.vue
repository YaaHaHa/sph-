<template>
  <div>
    <el-form :inline="true" :model="formInline" class="demo-form-inline" :disabled="isShowAdd">
      <el-form-item label="一级分类">
        <el-select
          v-model="formInline.category1Id"
          placeholder="请选择"
          @change="changeCategory1"
        >
          <el-option
            v-for="c1 in category1List"
            :key="c1.id"
            :label="c1.name"
            :value="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="二级分类">
        <el-select
          v-model="formInline.category2Id"
          placeholder="请选择"
          @change="changeCategory2"
        >
          <el-option
            v-for="c2 in category2List"
            :key="c2.id"
            :label="c2.name"
            :value="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="三级分类">
        <el-select
          v-model="formInline.category3Id"
          placeholder="请选择"
          @change="changeCategory3"
        >
          <el-option
            v-for="c3 in category3List"
            :key="c3.id"
            :label="c3.name"
            :value="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  // 收集c1,c2,c3通讯给attr路由中，哪里才是展示的地方
  name: "CategorySelector",
  data() {
    return {
      formInline: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      category1List: [],
      category2List: [],
      category3List: [],
    };
  },
  //  接到父组件传来的数据，决定form是否禁用
  props: ["isShowAdd"],
  mounted() {
    this.getCategory1Lis();
  },
  methods: {
    //   一上来先获取所以一级分类的列表
    async getCategory1Lis() {
      const result = await this.$api.category.getCategory1();
      if (result.code === 200) {
        this.category1List = result.data;
      }
    },

    //根据选中的1级分类id获取这个一级分类的所有二级分类列表，此时二三级分类列表数据要为空
    async changeCategory1(category1Id) {
      this.formInline.category1Id = category1Id;
      this.formInline.category2Id = "";
      this.formInline.category3Id = "";

      this.category2List = [];
      this.category3List = [];
      const result = await this.$api.category.getCategory2(category1Id);
      if (result.code === 200) {
        this.category2List = result.data;
        // 触发自定义事件把id送到父
        this.$emit("collectId", { id: category1Id, lever: 1 });
      }
    },
    //根据选中的2级分类id获取这个二级分类的所有三级分类列表
    async changeCategory2(category2Id) {
      this.formInline.category2Id = category2Id;

      this.formInline.category3Id = "";
      this.category3List = [];
      const result = await this.$api.category.getCategory3(category2Id);
      if (result.code == 200) {
        this.category3List = result.data;
        // 触发自定义事件把id送到父
        this.$emit("collectId", { id: category2Id, lever: 2 });
      }
    },
    //选中三级分类的id，要做的事情
    //三级分类被选中，下面有数据了，三级分类被选中，下面是要发请求获取属性数据进行展示
    //但是，这个请求不是在当前组件发的，而是在父组件发的
    //因此我们要组件通信
    changeCategory3(category3Id) {
      this.formInline.category3Id = category3Id;
      // 触发自定义事件把id送到父
      this.$emit("collectId", { id: category3Id, lever: 3 });
    },
    onSubmit() {
      console.log("submit!");
    },
  },
};
</script>

<style>
</style>