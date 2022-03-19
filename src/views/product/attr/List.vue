<template>
  <div>
    <el-card>
      <CategorySelector @collectId="collectId" :isShowAdd="isShowAdd"/>
    </el-card>
    <el-card style="margin-top: 20px">
      <div v-show="!isShowAdd">
        <!-- 这个添加属性只是跳转到添加页 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddDiv"
          :disabled="!category3Id"
          >添加属性</el-button
        >
        <el-table :data="attrList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="name" label="属性名称" width="150">
          </el-table-column>
          <el-table-column label="属性值列表" width="width">
            <template slot-scope="{ row }">
              <el-tag
                type="success"
                v-for="v in row.attrValueList"
                :key="v.id"
                >{{ v.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="{ row }">
              <HintButton
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改"
                @click="showUpdataDiv(row)"
                >修改</HintButton
              >
              <el-popconfirm
                :title="`确认删除${row.name}}`"
                @onConfirm="deleteAttr(row.id)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除"
                  >删除</HintButton
                >
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加属性的div -->
      <div v-show="isShowAdd">
        <el-form :inline="true" :model="attrForm" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input
              v-model="attrForm.name"
              placeholder="请输入属性名"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrForm.name"
          >添加属性值</el-button
        >
        <el-button @click="isShowAdd = false">取消</el-button>

        <el-table :data="attrForm.attrValueList" style="width: 100%" border>
          <el-table-column type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                v-if="row.isEdit"
                :ref="$index"
                v-model="row.valueName"
                @blur="showList(row)"
                placeholder="请输入属性名"
                size="mini"
                @keyup.enter.native="showList(row)"
              ></el-input>
              <!-- 是input还是span? -->
              <span
                v-else
                @click="showInput(row, $index)"
                style="diplay: block; width: 100%; height: 100%"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`确认删除${row.valueName}?`"
                @onConfirm="attrForm.attrValueList.splice($index, 1)"
              >
                <HintButton
                  type="danger"
                  icon="el-icon-delete"
                  slot="reference"
                  size="mini"
                  title="删除"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button
          type="primary"
          @click="save"
          :disabled="attrForm.attrValueList === 0"
          >保存</el-button
        >
        <el-button @click="isShowAdd = false">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "AttrList",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",

      attrList: [],
      isShowAdd: false,
      // 这个是属性值列表，在点击进入修改属性值列表中这里才被赋值的
      attrForm: {
        name: "", // 这个是被选中的三级分类名称
        attrValueList: [
          // 这个是属性值列表
          // {
          //   attrId: 0,该三级分类的id
          //   id: 0,
          //   valueName: "string",
          //   isEdit: false, // 属性值是显示输入框还是span，每一个属性值中都要有一个
          // },
        ],
        // id: this.category3Id,  //这样不行，在data当中不能使用this
        id: 0,
        categoryLevel: 3, // 分类等级3
      },
    };
  },
  methods: {
    // 删除属性，然后重新获取数据
    async deleteAttr(id) {
      try {
        await this.$api.attr.delete(id);
        this, this.getAttrList();
        this.$message.success("删除成功！");
      } catch (error) {
        this.$message.error("删除失败");
      }
    },
    // 点击保存，发送请求
    /*     获取收集的参数attrForm
			整理参数：
				1、属性值名称如果为空串，从属性值列表当中去除
				2、请求的时候得把不需要的属性值对象当中的属性数据去除掉，比如属性值当中的isEdit
				3、属性值列表如果没有属性值，不发请求
			发请求
			成功   提示  返回列表  重新获取数据
			失败   提示 */
    async save() {
      let attr = this.attrForm;
      attr.attrValueList = attr.attrValueList.filter((attrValue) => {
        // 1、属性值名称如果为空串，从属性值列表当中去除
        // 2、请求的时候得把不需要的属性值对象当中的属性数据去除掉，比如属性值当中的isEdit
        if (attrValue.valueName.trim() !== "") {
          delete attrValue.isEdit;
          return true; // 如果是不是空的留下
        }
      });
      // 3、属性值列表如果没有属性值，代表没有属性值，不发请求
      if (attr.attrValueList.length === 0) {
        this.$message.info("属性值不能为空");
        return;
      }
      try {
        await this.$api.attr.addOrUpdate(this.attrForm);
        this.getAttrList();
        this.isShowAdd = false;
        this.$message.success("保存成功!");
      } catch {
        this.$message.error("保存失败");
      }
    },
    // 属性值输入框失去焦点或点击回车就显示span，不能为空，不能重复
    showList(row) {
      // 输入的文字要符合要求，进行效验
      let valueName = row.valueName;
      if (valueName.trim() === "") {
        this.$message.info("信息不能为空");
        return; // 一定要返回，结束这个函数调用
      }
      //判断输入的数据和其它的属性值名称数据是不是重复,得除去自身，判断和其它的是不是相同
      let isRepeat = this.attrForm.attrValueList.some((a) => {
        // 排除自己之外的其他
        if (a != row) {
          return a.valueName === valueName;
        }
      });
      // 如果重复
      if (isRepeat) {
        row.valueName = "";
        this.$message.info("不能重复");
        return; // 一定要返回，结束这个函数调用
      }
      row.isEdit = false;
    },
    // 点击属性值的span显示输入框，对传过来的那个row中的isEdit设为true，并自动获取焦点，怎么确定是哪一个输入框类，为了自动获取焦点，传来了index
    showInput(row, index) {
      row.isEdit = true;

      // 因为我们获取这个节点获取的太快啦
      // 上面我们把row.isEdit = true改完之后，由于dom元素是通过vif才开始创建，紧接着你就开始获取这个元素
      // 此时我的input还没创建好，所以你获取到的就是undefined
      //$nextTick 代表在页面的最近一次更新完成之后执行回调

      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    // 点击修改属性，切换到修改界面
    showUpdataDiv(row) {
      this.isShowAdd = true;
      /* this.attrForm={  要用深度拷贝，因为要效验的，不能直接就改了
        ...row
      } */
      this.attrForm = cloneDeep(row);
      // 为arrtList中每一个对象添加isEdit属性，先全是span
      this.attrForm.attrValueList.forEach((item) => {
        // item.isEdit = false
        // 不能用上面的写法，因为这是在后期给响应式对象添加新的属性
        // 只有在数据初始化阶段（beforeCreate 和 created之间初始化的对象，对象当中属性才是响应式的数据）
        // 此时点击按钮给响应式对象添加新的属性数据，不是响应式的数据，这样会导致后期添加了以后页面不变化
        // 如果后期添加的属性要响应式  必须使用 Vue.set 或者是 vm.$set才能让其成为响应式数据
        this.$set(item, "isEdit", false);
      });
    },

    // 添加属性值，当点击添加的时候，表格中要出现一行让用户输入，问了占位
    addAttrValue() {
      this.attrForm.attrValueList.push({
        // 不管是添加还是修改，都有可能添加属性
        // 如果有这个id那就是修改，没有就是添加，因为undefind无所谓
        attrId: this.attrForm.id,
        valueName: "", // 弹出那一行收集的数据
        isEdit: true, // 属性值是否是修改状态，也就是说是否是输入框样式
      });
      // 因为添加的一个新的是在末尾，所以要这样获取焦点，因为这边虽然push进去，那边也显示的，但是同时input在生成
      // 上面我们isEdit = true后，由于dom元素是通过vif才开始创建，紧接着你就开始获取这个元素
      // 此时我的input还没创建好，所以你获取到的就是undefined
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },

    // 是否显示添加div，因为表格与添加div是有你没我的关系
    showAddDiv() {
      this.isShowAdd = true;
      // 清空上次收集的数据，完成其余数据的收集id与id
      this.attrForm = {
        name: "", // 属性名
        attrValueList: [
          // {
          //   attrId: 0,
          //   id: 0,
          //   valueName: "string",
          // },
        ],
        // id: this.category3Id,  //这样不行，在data当中不能使用this
        // id: this.category3Id,
        id: 0,
        categoryLevel: 3,
      };
    },
    // 收集CategorySelector传来的id，干啥用？当最后一个三级id也集齐后就发请求
    async collectId({ id, lever }) {
      // lever分辨是几级分类
      if (lever === 1) {
        // 一级分类一变，二三级要清空，而且组件中保存的列表数据也清空，等一二三id全有了发请求拿数据
        this.category1Id = id;
        this.category2Id = "";
        this.category3Id = "";

        this.attrList = [];
      } else if (lever === 2) {
        this.category2Id = id;
        this.category3Id = "";
        this.attrList = [];
      } else {
        // 第三等级的id来了
        this.category3Id = id;

        // 发请求
        this.getAttrList();
      }
    },

    // 发请求获取属性数据
    async getAttrList() {
      const result = await this.$api.attr.getList(
        this.category1Id,
        this.category2Id,
        this.category3Id
      );
      if (result.code === 200) {
        this.attrList = result.data;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>