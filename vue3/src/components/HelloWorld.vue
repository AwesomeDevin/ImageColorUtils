
<style  scoped>
* {
  margin: 0;
}
.container-water-fall {
  width: 100vw;
  box-sizing: border-box;
  
}
.githubdata {
  float: right;
  margin-right: 90px;
  
}

</style>
<template>
  <div class="container-water-fall">
    <!-- <h1 style="position: fixed;left: 0;top: 100px;font-style: 15px;color:blue;z-index: 1000;">{{loadstatus}}</h1> -->
    <div class="btn-group">
      <button @click="loadmore">LoadMore</button>
      <button @click="switchCol(5)">5column(列)</button>
      <button @click="switchCol(8)">8column(列)</button>
      <button @click="switchCol(10)">10column(列)</button>
      <button @click="reset">reset(重置)</button>
      <a
        style="color:red;"
        href="https://github.com/Rise-Devin/vue-waterfall2/blob/master/README.md"
        target="_blank"
      >GITHUB</a>
      <b style="color:blue">滚动至底部可触发loadmore</b>
    </div>
    <!-- <waterfall :col="col" :data="data" @loadmore="loadmore">
      <template>
        <div class="cell-item" v-for="(item,index) in data" :key="index">
          <img v-if="item.img" :src="item.img" alt="加载错误">
          <div class="item-body">
            <div class="item-desc">{{item.title}}</div>
            <div class="item-footer">
              <div
                v-if="item.avatar"
                class="avatar"
                :style="{backgroundImage : `url(${item.avatar})` }"
              ></div>
              <div class="name">{{item.user}}</div>
              <div class="like" :class="item.liked?'active':''">
                <i></i>
                <div class="like-total">{{item.like}}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </waterfall> -->
  </div>
</template>

<script>
/*
  注意:
  1.itemWidth需要与gutterWidth一起使用才会生效，否则会进行自适应宽度
  2.使用了waterfall的组件不允许使用scoped,否则样式会有问题
*/
export default {
  props: {
    title: String
  },

  data() {
    return {
      data: [],
      col: 5,
      loading: false,
      gitHubData: {},
      originData: [
        {
          img:
            "https://image.watsons.com.cn//upload/8a316140.png?w=377&h=451&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "最近浴室新宠，日系神仙好物了解一下～",
          user: "www",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/083767f0.JPG?w=828&h=620&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精",
          like: "952"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/02a4f38d.jpg?w=1067&h=1067&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "最近浴室新宠，日系神仙好物了解一下～",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/589585c1.jpeg?x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/d862d932.jpg?w=1080&h=1440&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "最近浴室新宠，日系神仙好物了解一下～",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/eb4fb58f.jpg?w=1080&h=1080&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/71d19462.jpg?x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title:
            "贵妇级好用的水乳有哪些呢？千万不要去乱尝试贵妇级好用的水乳有哪些呢？",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/415f984f.jpeg?w=828&h=1104&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "千万不要去乱尝试贵妇级好用的水乳有哪些呢？千万不要去乱尝试",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/5c3e51e4.jpg?w=720&h=960&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "夏天用这款姨妈巾，让你体验真正的清爽",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/92761043.JPG?w=1000&h=999&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "最近浴室新宠，日系神仙好物了解一下～",
          user: "迷人的小妖精迷人的小妖精123",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/da61c0f5.jpg?w=959&h=958&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "千万不要去乱尝试贵妇级好用的水乳有哪些呢？千万不要去乱尝试",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/fcd68df4.jpg?w=1080&h=1080&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "最近浴室新宠，日系神仙好物了解一下～",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/bef41e67.JPG?w=712&h=534&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "夏天用这款姨妈巾，让你体验真正的清爽",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/25ab20fe.JPG?w=1000&h=1200&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精123",
          like: "953"
        },
        {
          img:
            "https://ci.xiaohongshu.com/eb971d00-05ab-5b2a-ba03-52d8f544c42b?imageView2/2/w/400/q/50/format/jpg",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "最近浴室新宠，日系神仙好物了解一下～",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/4a3c1788.jpg?w=823&h=1000&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "夏天用这款姨妈巾，让你体验真正的清爽",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/0a89e6b7.jpg?w=1080&h=1920&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "千万不要去乱尝试贵妇级好用的水乳有哪些呢？千万不要去乱尝试",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/99253111.jpg?w=1080&h=1920&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精123",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/13afe9a7.jpg?x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title:
            "贵妇级好用的水乳有哪些呢？千万不要去乱尝试贵妇级好用的水乳有哪些呢？千万不要去乱尝试贵妇级好用的水乳有哪些呢？千万不要去乱尝试",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/98c7c4c3.jpg?w=1210&h=1210&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/54c5d7b4.jpg?w=828&h=991&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/71d19462.jpg?x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "夏天用这款姨妈巾，让你体验真正的清爽",
          user: "迷人的小妖精迷人的小妖精123",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/642cb83c.jpeg?w=1080&h=1080&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/31e42833.jpg?w=750&h=750&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/92761043.JPG?w=1000&h=999&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "夏天用这款姨妈巾，让你体验真正的清爽",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/60cc9b8e.jpg?w=991&h=744&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "150元搞定全套护肤品，这些护肤好物必须交出来！",
          user: "迷人的小妖精迷人的小妖精123",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/b709ed72.jpg?w=552&h=414&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "最近浴室新宠，日系神仙好物了解一下～",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/137b50b0.jpg?x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "夏天用这款姨妈巾，让你体验真正的清爽",
          user: "迷人的小妖精迷人的小妖精",
          like: "952"
        },
        {
          img:
            "https://image.watsons.com.cn//upload/31e42833.jpg?w=750&h=750&x-oss-process=image/resize,w_1080",
          avatar:
            "https://img.xiaohongshu.com/avatar/5b7d198a7e6e15000155f7c9.jpg@80w_80h_90q_1e_1c_1x.jpg",
          title: "最近浴室新宠，日系神仙好物了解一下～",
          user: "迷人的小妖精迷人的小妖精",
          like: "953"
        }
      ]
    };
  },
  computed: {
    itemWidth() {
      return 133 * 0.5 * (document.documentElement.clientWidth / 375);
    },
    gutterWidth() {
      return 10 * 0.5 * (document.documentElement.clientWidth / 375);
    }
  },
  methods: {
    toGitHub() {
      window.open(
        "https://github.com/Rise-Devin/vue-waterfall2/blob/master/README.md",
        "_blank"
      );
    },
    reset() {
      this.data = [];
    },

    switchCol(col) {
      this.col = col;
    },

    loadmore() {
      this.loading = true;
      setTimeout(() => {
        this.data = this.data.concat(this.originData, this.originData);
        this.loading = false;
      }, 1000);
    }
  },
  mounted() {
    this.data = this.originData;
  }
};
</script>