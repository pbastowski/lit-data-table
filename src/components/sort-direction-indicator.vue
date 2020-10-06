<template>
    <span>
        <i v-if="sortDesc===true" class="fa fa-sort-down" key="down"></i>
        <i v-if="sortDesc===false" class="fa fa-sort-up" key="up"></i>
    </span>
</template>
<script>
export default {
    props: {
        sortDesc: Boolean,
    },
}
</script>
