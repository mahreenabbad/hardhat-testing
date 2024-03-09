const hre = require("hardhat");

// console.log(hre)

async function main(){
    const currentTimeStampInSeconds = Math.round(Date.now()/1000);
    const ONE_YEAR_IN_SECONDS= 356*24*60*60;
    const unlockedTime = currentTimeStampInSeconds+ ONE_YEAR_IN_SECONDS;
    
    const lockedAmount = hre.ethers.parseEther("1");


    // console.log(currentTimeStampInSeconds);
    // console.log(ONE_YEAR_IN_SECONDS);
    // console.log(unlockedTime);
    // console.log(lockedAmount);
    // const MyTest = await hre.ethers.getContractFactory("MyTest");
    const mytest = await hre.ethers.deployContract("MyTest",[unlockedTime],{value:lockedAmount});
    await mytest.waitForDeployment();

    console.log(`contract contain ${lockedAmount} ETH & address :${mytest.target}`);
    // console.log(mytest)

}
main().catch((error)=>{
    console.log(error);
    process.exitCode =1;
})