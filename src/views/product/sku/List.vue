<template>
<div>
  skuList
  <Child/>
</div>
</template>

<script>
import Child from './components/child.vue'
export default {
  name: "SkuList",
  components:{
    Child
  }
};
</script>

<style lang="scss" scoped>
#childBox{
  color: yellow;
}
/* scss或less中无法识别>>> 
#childBox >>> h2{
  color: green;
} 
*/
#childBox ::v-deep h2{
  color: green;
}
</style>