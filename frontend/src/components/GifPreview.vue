<template>
    <div class="gif-preview-container">
        <ul>
            <li v-for="gif in gifs" :key="gif.id">
                {{gif}}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: ['gifs']
}
</script>

<style>

</style>
