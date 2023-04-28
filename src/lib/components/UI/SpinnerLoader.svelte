<div class="spinner">
  <div></div>
  <div></div>
</div>

<style>
  .spinner {
    width: 100px;
    height: 100px;
    position: relative;
  }

  .spinner div {
    position: absolute;
    height: 100%;
    width: 100%;
    border: 10px solid transparent;
    border-top-color: rgb(56 189 248);
    border-radius: 50%;
    animation: spinnerOne 1.2s linear infinite;
  }

  .spinner div:nth-child(2) {
    border: 10px solid transparent;
    border-top-color: rgb(56 189 248);
    animation: spinnerTwo 1.2s linear infinite;
  }

  @keyframes spinnerOne {
    0% {
      transform: rotate(0deg);
      border-width: 10px;
    }
    50% {
      transform: rotate(180deg);
      border-width: 1px;
    }
    100% {
      transform: rotate(360deg);
      border-width: 10px;
    }
  }
  @keyframes spinnerTwo {
    0% {
      transform: rotate(0deg);
      border-width: 1px;
    }
    50% {
      transform: rotate(-180deg);
      border-width: 10px;
    }
    100% {
      transform: rotate(-360deg);
      border-width: 1px;
    }
  }
</style>
