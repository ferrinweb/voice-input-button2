<!-- from https://codepen.io/aurer/pen/jEGbA -->
<template>
  <div class="recording" title="recording…">
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 20 20" style="enable-background:new 0 0 50 50;" xml:space="preserve">
      <rect x="0" y="8" width="4" height="4" :fill="color">
        <animate attributeName="height" attributeType="XML" values="4;20;4" begin="0s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="8; 0; 8" begin="0s" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="7" y="8" width="4" height="4" :fill="color">
        <animate attributeName="height" attributeType="XML" values="4;20;4" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="8; 0; 8" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="14" y="8" width="4" height="4" :fill="color">
        <animate attributeName="height" attributeType="XML" values="4;20;4" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="8; 0; 8" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
      </rect>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'recording-icon',
  props: {
    color: {
      type: String,
      default: '#333'
    }
  }
}
</script>

<style lang="scss" scoped>
  .recording{
    width: 20px;
    height: 20px;
    margin: auto;
  }
</style>
