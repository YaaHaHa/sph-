<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showDialog"
      >添加</el-button
    >

    <!-- 
      table写法
      先写eltable 回车
      有几列就复制几个列
      先把动态数据属性data干掉
      有边框得添加table的border属性
      每个列的width控制列的宽度
      每个列的label控制这个列的名称
      想让那个列居中，那么哪个列需要添加align="center"
      那个列是序号，需要添加type = "index"
    -->
    <el-table border :data="trademarkList" style="width: 100%; margin: 20px 0">
      <!-- data是要展示的动态数据，必须是一个数组 
    table当中展示数据的时候，每个列内部都暗含了一个vfor，都在遍历data的数组当中的每个品牌对象
    每一个列内部都有展示数据的功能，只不过展示的是数据的哪个属性，我们可以通过prop去告知
    没个列展示数据的时候都会给你留有作用域插槽，那么如果你需要修改展示时候的结构，那么你就得去完善作用域插槽
    如果不需要修改展示数据的结构，就不需要关心作用域插槽
    -->
      <!-- 序号这一列type成index，才能自动添加序号 -->
      <!-- prop是跟和data联系起来的，显示的数据字段。data是列表，prop是列表中每一项对象的属性名 -->
      <el-table-column
        type="index"
        prop="prop"
        label="序号"
        align="center"
        width="80"
      >
      </el-table-column>
      <el-table-column label="品牌名称" width="width" prop="tmName">
        <!-- width不写数值表示等分 -->
      </el-table-column>
      <el-table-column label="品牌logo" width="width" prop="logoUrl">
        <!-- 要修改子组件的结构，所以要用作用域插槽 -->
        <!-- <template slot-scope="{ row, $index }"> row是data中被遍历数组的每一项，$index是下标-->
        <template slot-scope="{ row }">
          <img :src="row.logoUrl" alt="#" style="width: 80px; height: 60px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="width">
        <!-- 既然不需要从子里面拿每一条的数据，就不用取出来,省的报警告 -->
        <!-- <template slot-scope="{row, $index}">  -->
        <template slot-scope="{ row }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
            >修改</el-button
          >
          <!-- 注意修改的时候toFrom中是有id的，这个id是在遍历生成table中被拿来用的，
          所以有无id可作为dialog是显示添加还是修改 
         -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="text-align: center"
      :page-size="limit"  
      :pager-count="7"
      :page-sizes="[3, 5, 10, 20]"
      layout="prev, pager, next, jumper, ->, sizes, total"
      :total="total"
      :current-page="page"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
    />

    <!-- 
      dialogFormVisible是决定对话框显示和隐藏
      :model="from"，model=对象 指定收集的数据最终放在哪  表单收集的数据在from对象中
      form-item当中  是收集数据的每一项  每一项都可以有label指定这一项名称，label-width="100px"指定名称宽度
			  每一项当中都可以对应收集数据，收集的数据一般都是放在我们指定的对象当中
        :rules是表单验证对象


     -->
    <el-dialog
      :title="toForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form :model="toForm" :rules="rules" ref="ruleForm" style="width: 80%">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="toForm.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌Logo" label-width="100px" prop="logoUrl">
          <!-- upload里面的action就是让你自己去写真实的上传接口，对应上传到哪里 -->
          <!-- show-file-list指定上传的是不是照片墙，现在上传的是一张不是照片墙 -->
          <!-- :before-upload是上传前的回调，这里用来验证上传文件的格式是否符合要求 -->
          <!-- :on-success是上传成功后的回调，这里用来把请求回来的数据做显示或其他处理 -->
          <el-upload
            class="avatar-uploader"
            action="/api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="toForm.logoUrl" :src="toForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from "element-ui";
export default {
  name: "TradeMarkList",
  data() {
    // rule就是来占个位
    let validateTmName = (rule, value, callback) => {
      //value就是你要校验的数据
      //callback代表校验成功还是失败的回调
      //如果传递了一个错误对象，那么就代表验证失败
      //如果没有传递任何参数就代表验证成功
      if (value.length < 2 || value.length > 10) {
        callback(new Error("长度必须是2到10之间"));
      } else {
        callback();
      }
    };
    return {
      trademarkList: [],
      page: 1,
      limit: 3,
      total: 0,

      dialogFormVisible: false, // 控制对话框是否显示

      // el-from中收集的数据
      toForm: {
        tmName: "",
        logoUrl: "",
      },

      // 表单验证对象
      rules: {
        //这个对象代表是表单验证的规则对象
        //每个字段都是一个数组，数组里面放的就是我们验证的规则对象，几个规则就是几个对象
        //每个规则对象都可以规定规则名称，消息名称 和 触发时机
        //触发时机 有三种情况：失去焦点的时候  输入框改变的时候  整体校验的时候
        tmName: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
          // 必须，错误提示时候'请输入活动名称'，触发时机是失去焦点后

          // 自定义校验规则
          { validator: validateTmName, trigger: "change" },

          // {
          //   min: 3,
          //   max: 10,
          //   message: "长度在 3 到 10 个字符",
          //   trigger: "blur",
          // },
        ],
        // 这个触发写什么都无所谓，upload触发时机必须是整体校验才会触发
        logoUrl: [
          { required: true, message: "请选择上传图片", trigger: "change" },
        ],
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    // 删除品牌
    deleteTrademark(row) {
      this.$confirm(`你确定要删除${row.tmName}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            const result = await this.$api.trademark.delete(row.id);
              this.$message.success(`删除${row.tmName}品牌成功`);
              // 如果在删前，本页面只有一条，删完后就往前蹦一页
              this.getTrademarkList(
                this.trademarkList.length <= 1 ? this.page - 1 : this.page
              );
          } catch (error) {
            this.$message.error(`修改${row.tmName}失败`);
          }
        })
        // 处理点击取消按钮的逻辑
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // Dialog对话框点确定的回调，是添加还是修改，然后发请求
    addOrUpdate() {
      this.$refs.ruleForm.validate(async (valid) => {
        if (valid) {
          let trademark = this.toForm;
          // 返回列表页
          this.dialogFormVisible = false;
          try {
            const result = await this.$api.trademark.addOrUpdate(trademark);

            if (result.code === 200) {
              // 如果成功，提示成功，然后要跳到哪一页呢？
              this.$message.success(
                trademark.id ? "修改品牌成功" : "添加品牌成功"
              );
              // 如果是添加的就跳到第一页，修改的就跳到本页
              this.getTrademarkList(trademark.id ? this.page : 1);
            }
          } catch {
            // 失败干啥
            this.$message.success(toForm.id ? "修改品牌失败" : "添加品牌失败");
          }
        } else {
          console.log("校验失败不提交");
          return false;
        }
      });
    },
    // 修改显示Dialog对话框

    // 不能这么写，如果这么写，那么table展示的数据和tmForm要修改的数据就是同一个数据对象
    //只要你动了tmform的数据，其实也是在动列表当中的数据，所以不能让他们是同一个数据
    // this.tmForm = row   //把要展示的这个数据赋值给tmForm 而且数据里面有id

    // 拷贝  深拷贝和浅拷贝
    // 拷贝 必然出现新的地址开辟新的空间，也就是说有不同的数据存储位置
    // 深拷贝和浅拷贝
    // 谈的其实是拷贝的东西  是什么？
    // 如果拷贝对象拷贝的是地址，那么就是浅拷贝，
    // 拷贝的是对象里面的值，就是深拷贝
    // 深浅拷贝其实针对对象数据类型出现的
    // 基本数据类型不存在什么深浅拷贝
    //深拷贝还是浅拷贝？
    //row里面   都是基本数据   不谈深浅拷贝
    //浅拷贝
    showUpdateDialog(row) {
      this.toForm = {
        ...row,
      };
      this.dialogFormVisible = true;
    },

    // 上传成功后的回调
    handleAvatarSuccess(res, file) {
      // res是action="/api/admin/product/fileUpload"请求回来的响应体
      // file是文件相关的对象，里面也有response属性，存储这请求回来的响应体
      this.toForm.logoUrl = res.logoUrl;
    },

    // 上传前的回调函数，用来验证上传的格式是否符合要求，file是文件的信息
    beforeAvatarUpload(file) {
      const typeArr = ["image/jpeg", "image/png"];

      // 确保上传的文件是jpg或png格式的
      const isJpegOrPng = typeArr.indexOf(file.type) !== -1;

      // const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJpegOrPng) {
        this.$message.error("上传头像图片只能是 JPG 格式或者PNG格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJpegOrPng && isLt2M;
    },

    // 显示添加对话框
    showDialog() {
      this.dialogFormVisible = true;
      this.toForm = {
        tmName: "",
        logoUrl: "",
      };
    },
    // 改变显示条数
    handleSizeChange(limit) {
      this.limit = limit;
      this.getTrademarkList();
    },
    // 获取品牌列表
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$api.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      } else {
        Message({
          message: "获取品牌列表失败",
          type: "error",
          duration: 2 * 1000,
        });
      }
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>