class MyPromise{
  constructor(fn){

    this.status = 'pending'
    this.data = undefined
    this.onResolvedCallback = []    //resolve回调
    this.onRejectCallback = []     //reject回调
    try{
      fn&&fn(this.resolve.bind(this),this.reject.bind(this))
    }catch(e){
      this.reject(e)
    }
  }
  resolve(val){
    if(val instanceof MyPromise)
    {
      return val
    }
    if(this.status === 'pending')
    {
      this.status = 'fulfilled'
      this.data = val
      for(var item of this.onResolvedCallback)
      {
        item()
      }
    }
  }
  reject(val){
    if(val instanceof MyPromise)
    {
      return val
    }
    if(this.status === 'pending')
    {
      this.status = 'rejected'
      this.data = val
      for(var item of this.onRejectCallback)
      {
        item()
      }
      // this.onRejectCallback.length>0&&this.onRejectCallback[0]()
    }
  }
  static handleResolve(nextresult,resolve,reject){
    // console.log()

    if(nextresult instanceof MyPromise)   //return 1个promise实例时 ，针对处理
    {
      nextresult.then((data)=>{
        resolve(data)
      }).catch((error)=>{
        reject(error)
      })
    }
    else{
      resolve(nextresult)
    }
    

  }
  then(successFallBack,failFallBack){

    return new MyPromise((resolve,reject)=>{    
    // console.log('execute then',this.status,successFallBack,failFallBack)  
    // console.log(this.data)
      let nextresult
      if(this.status === 'fulfilled')
      {
        nextresult = successFallBack&&successFallBack(this.data)
        nextresult&&MyPromise.handleResolve(nextresult,resolve,reject)
      }
      else if(this.status === 'rejected')
      {
         nextresult = failFallBack&&failFallBack(this.data)
         nextresult&&MyPromise.handleResolve(nextresult,resolve,reject)
      }
      else{
        successFallBack&&this.onResolvedCallback.push( ()=>{
           nextresult = successFallBack(this.data)
           nextresult&&MyPromise.handleResolve(nextresult,resolve,reject)
        })

        failFallBack&&this.onRejectCallback.push(()=>{
           nextresult = failFallBack(this.data)
           nextresult&&MyPromise.handleResolve(nextresult,resolve,reject)
        })
        // console.log(this.onResolvedCallback,this.onRejectCallback)
      }
    })
  }

  catch(failFallBack){
    return this.then(null,failFallBack)
  }

  finally(callbcak){
    callbcak()
  }

}

MyPromise.deferred = function () {
  var result = {};
  result.promise = new MyPromise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}


module.exports =  MyPromise