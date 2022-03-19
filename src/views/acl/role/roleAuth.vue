<template>
  <div>
    <el-input disabled :value="$route.query.roleName"></el-input>
    <el-tree
      :props="props"
      :data="allPermissions"
      node-key="id"
      show-checkbox
      ref="tree"
    >
    </el-tree>
    <el-button :loading="loading" type="primary" @click="save">保存</el-button>
    <el-button @click="$router.replace({ name: 'Role' })">取消</el-button>
  </div>
</template>

<script>
export default {
  name: "RoleAuth",
  data() {
    return {
      loading: false, //  用来标识是否正在保存请求中的标识, 防止重复提交
      props: {
        label: "label",
        children: "children",
      },
      count: 1,
      allPermissions: [], // 所有权限
    };
  },
  created() {
    this.getAllAuth();
  },
  methods: {
    // 根据id获取这个角色的所有权限列表
    getAllAuth() {
      this.$api.role.getAssign(this.$route.params.id).then((result) => {
        let allPermissions = result.data;
        this.allPermissions = allPermissions;
        const checkedIds = this.getCkeckAuth(allPermissions);
        this.$refs.tree.setCheckedKeys(checkedIds);
      });
    },
    // 挑出被选中的复选框id，才能在初始化时显示
    getCkeckAuth(allPermissions, initArr = []) {
      let res = allPermissions.reduce((arr, item) => {
        if (item.select && item.level === 4) {
          // 最主要的还是这一个if，里面才是真正收集的
          arr.push(item.id);
          // return arr;   //  不能在这里返回，因为不是每一个都能进入到这里return的
        } else if (item.children) {
          // item.children = this.getCkeckAuth(item.children);  没有嵌套结构。就不用给children
          this.getCkeckAuth(item.children, initArr); // 直接调用就行了
        }
        return arr; //
      }, initArr);
      return res;
    },
    // 保存角色分配权利
    save() {
      let ids = this.$refs.tree.getCheckedKeys().join(",");
      console.log(ids);
      /* 
        vue elementUI tree树形控件获取父节点ID的实例
        修改源码:
        情况1: element-ui没有实现按需引入打包
          node_modules\element-ui\lib\element-ui.common.js    25423行修改源码  去掉 'includeHalfChecked &&'
          // if ((child.checked || includeHalfChecked && child.indeterminate) && (!leafOnly || leafOnly && child.isLeaf)) {
          if ((child.checked || child.indeterminate) && (!leafOnly || leafOnly && child.isLeaf)) {
        情况2: element-ui实现了按需引入打包
          node_modules\element-ui\lib\tree.js    1051行修改源码  去掉 'includeHalfChecked &&'
          // if ((child.checked || includeHalfChecked && child.indeterminate) && (!leafOnly || leafOnly && child.isLeaf)) {
          if ((child.checked || child.indeterminate) && (!leafOnly || leafOnly && child.isLeaf)) {
        */
      this.loading = true;
      this.$api.promission.doAssign(this.$route.params.id, ids).then((result) => {
        this.$message.success(result.$message || "分配权限成功");
        console.log(result);
        this.loading = false;
        // 必须在跳转前获取(跳转后通过this获取不到正确的数据了)
        const roleName = this.$route.query.roleName;
        const roles = this.$store.getters.roles;
        // 然后跳转
        this.$router.replace("/acl/role/list", () => {
          // 跳转成功后, 判断如果更新的是当前用户对应角色的权限, 重新加载页面以获得最新的数据
          if(roles.includes(roleName)){
            window.location.reload()
          }
        });
      });
    },
  },
};
</script>

<style>
</style>