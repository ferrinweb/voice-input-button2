<!-- Author: ferrinweb -->
<!-- Create Time: 2019/1/2 15:44 -->
<!-- Description: recording-tip -->
<template>
  <div class="recording-tip" :class="position">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'recording-tip',
  props: {
    position: {
      type: String,
      default: 'top'
    }
  }
}
</script>

<style lang="scss" scoped>
  .recording-tip{
    position: absolute;
    width: auto;
    max-width: 270px;
    display: flex;
    justify-content: flex-end;
    white-space: nowrap;
    padding: 0;
    border-radius: 3px;
    background-color: #4b667d;
    box-shadow: rgba(0,0,0,.1) 0 2px 2px;
    color: #f2f2f2;
    pointer-events: none;
    overflow: hidden;
    border-width: 2px 15px 3px;
    border-style: solid;
    border-color: #4b667d;
    &:before{
      position: absolute;
      margin: auto;
      content: " ";
      width: 10px;
      height: 10px;
      background-color: inherit;
    }
    &.top{
      bottom: calc(100% + 5px);
      left: 50%;
      transform: translate3d(-50%,0,0);
      &:before{
        bottom: -5px;
        left: 0;
        right: 0;
        clip-path: polygon(0% 50%, 50% 100%, 100% 50%);
      }
    }
    &.right{
      left: calc(100% + 5px);
      top: 50%;
      transform: translate3d(0,-50%,0);
      &:before{
        left: -5px;
        top: 0;
        bottom: 0;
        clip-path: polygon(0% 50%, 50% 100%, 50% 0%);
      }
    }
    &.bottom{
      top: calc(100% + 5px);
      left: 50%;
      transform: translate3d(-50%,0,0);
      &:before{
        top: -5px;
        left: 0;
        right: 0;
        clip-path: polygon(0% 50%, 50% 0%, 100% 50%);
      }
    }
    &.left{
      right: calc(100% + 5px);
      top: 50%;
      transform: translate3d(0,-50%,0);
      &:before{
        right: -5px;
        top: 0;
        bottom: 0;
        clip-path: polygon(100% 50%, 50% 100%, 50% 0%);
      }
    }
  }
</style>
