<template>
  <div>
    <el-form :inline="true" :model="roleForm" class="demo-form-inline">
      <el-form-item>
        <el-input v-model="roleForm.roleName" placeholder="角色名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="searchRole"
          >查询</el-button
        >

        <el-button>清空</el-button>
      </el-form-item>
    </el-form>
    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="addrole">添加</el-button>
      <el-button type="danger" @click="deleteCkeck">批量删除</el-button>
    </div>

    <el-table
      ref="multipleTable"
      :data="roles"
      tooltip-effect="dark"
      v-loading="listLoading"
      border
      style="width: 960px"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column type="index" label="序号" width="55" align="center">
      </el-table-column>
      <!-- <el-table-column label="角色名称" prop="roleName" width="width"> -->
      <el-table-column label="角色名称" width="width">
        <!-- <template slot-scope="scope">{{ scope.row.date }}</template> -->
        <template slot-scope="{ row, $index }">
          <template v-if="row.edit">
            <el-input
              :ref="`input${$index}`"
              v-model="row.roleName"
              :placeholder="row.roleName"
              style="width: 480px"
              size="mini"
            ></el-input>

            <el-button
              class="cancel-btn"
              size="mini"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >
              取消
            </el-button>
          </template>
          <span v-else>{{ row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="{ row, $index }">
          <HintButton
            size="mini"
            type="info"
            icon="el-icon-info"
            title="分配权限"
            @click="$router.push(`/acl/role/auth/${row.id}?roleName=${row.roleName}`)"
          ></HintButton>
          <HintButton
            size="mini"
            type="primary"
            icon="el-icon-check"
            title="确定"
            @click="row.edit = false"
            v-if="row.edit"
          >
          </HintButton>
          <HintButton
            size="mini"
            type="primary"
            icon="el-icon-edit"
            title="修改角色"
            @click="updateRole(row, $index)"
            v-if="!row.edit"
          ></HintButton>
          <HintButton
            size="mini"
            type="danger"
            icon="el-icon-delete"
            title="删除权限"
            @click="removeRole(row)"
          ></HintButton>
        </template>
      </el-table-column>
    </el-table>
    <!-- @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
 -->
    <el-pagination
      :page-sizes="[5, 10, 15]"
      :page-size="limit"
      :current-page="page"
      layout="prev, pager, next, jumper, ->, sizes, total"
      :total="total"
      :pager-count="7"
      @current-change="getPageList"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "Role",
  data() {
    return {
      listLoading: true, // 数据是否正在加载
      roleForm: {
        roleName: "", // 角色名称
      },
      // 备一个空对象，发请求时把roleForm解析进去
      searchObj: {},
      roles: [],
      multipleSelection: [],    //  批量选中的
      page: 1,
      limit: 5,
      total: 80,
    };
  },
  mounted() {
    this.getPageList();
  },
  methods: {
    // 批量删除
    deleteCkeck() {
      this.$confirm("批量删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(async () => {
          if (this.multipleSelection.length === 0)
            throw new Error("批量删除不能为空");
          await this.$api.role.removeRoles(this.multipleSelection);
          this.$message.success("批量删除成功");
          this.getPageList();
        })
        .catch((error) => {
          if (error.message === "批量删除不能为空") {
            this.$message.warning("批量删除不能为空");
          } else {
            this.$message.warning("取消删除");
          }
        });
    },
    // table中的项被选中，收集起来
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 删除角色
    removeRole(row) {
      this.$confirm(`是否删除${row.roleName}`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(async () => {
          const result = await this.$api.role.removeById(row.id);
          this.getPageList(this.roles.length === 1 ? this.page - 1 : this.page);
          this.$message.success(result.message || "删除成功");
        })
        .catch(() => {
          this.$message.warning("删除失败");
        });
    },
    // 添加角色
    addrole() {
      console.log(1);
      // await this.$api.save(this.roleForm).then(result =>{
      //   this.$message.success('添加成功');
      // })
      this.$prompt("请输入新名称", "添加角色", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          this.$api.role.save({ roleName: value }).then((result) => {
            this.$message.success("添加成功");
          });
        })
        .catch(() => {
          this.$message.warning("取消添加!");
        });
    },
    // roleName取消编辑状态
    cancelEdit(row) {
      row.edit = false;
      row.roleName = row.originRoleName;
    },
    // 修改用户
    updateRole(row, index) {
      // 更改编辑状态
      row.edit = true;
      this.$nextTick(() => {
        this.$refs[`input${index}`].focus();
      });
    },

    // 请求角色列表
    getPageList(page = 1) {
      this.page = page;
      let { limit, searchObj } = this;
      this.$api.role
        .getPageList(page, limit, searchObj)
        .then((result) => {
          let { items, total } = result;
          this.roles = items.map((item) => {
            item.edit = false; // 用于标识是否显示编辑输入框的属性
            item.originRoleName = item.roleName; // 缓存角色名称, 用于取消
            return item;
          });
          this.total = total;
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    // 搜索按钮
    searchRole() {
      this.searchObj = { ...this.roleForm };
      this.getPageList();
    },
  },
};
</script>

<style>
</style>