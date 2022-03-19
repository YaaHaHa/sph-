<template>
    <div id="childBox">
        我是div
        <h2>我是h2</h2>
        <Child2 />
    </div>
</template>

<script>
import Child2 from './child2.vue'
export default {
    name:"Child",
    components:{
        Child2
    }
}
</script>

<style lang="scss" scoped>
#childBox{
    color: orange;
}
#child2Box{
    color: hotpink;
    
}
</style>