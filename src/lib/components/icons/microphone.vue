<!-- from https://codepen.io/aurer/pen/jEGbA -->
<template>
  <div class="microphone" title="录音">
    <svg t="1543917784414" class="icon" :fill="color" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2028" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32">
      <path d="M512 608 512 608c88 0 160-72 160-160L672 256c0-88-72-160-160-160l0 0c-88 0-160 72-160 160l0 192C352 536 424 608 512 608zM796.6 492.4c2.7-17.5-9.2-33.8-26.7-36.5-17.5-2.6-33.8 9.3-36.5 26.7C716.6 590.6 621.5 672 512 672c-109.5 0-204.7-81.5-221.4-189.5-2.7-17.5-19.1-29.4-36.5-26.7-17.5 2.7-29.4 19-26.7 36.5 20.2 130.5 124 227.8 252.6 241.8L480 832l-96 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0 0-97.9C672.5 720.1 776.4 622.9 796.6 492.4z" p-id="2029"></path>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'microphone',
  props: {
    color: {
      type: String,
      default: '#333'
    }
  }
}
</script>

<style lang="scss" scoped>
  .microphone{
    width: 32px;
    height: 32px;
    margin: auto;
  }
</style>
