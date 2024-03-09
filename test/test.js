const {time, loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
// console.log(time)
// console.log(loadFixture)

const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {expect} =require("chai");
const {ethers} =require("hardhat");

//describe and it keyword is from mocha library
//expect keyword from chai library
//extract the code which i want to run over and over again and convert into function
//whenever i call any test that code will run
describe("MyTest",function(){
 async function runEveryTime(){
    const ONE_YEAR_IN_SECONDS = 356*24*60*60;
    const ONE_GWEI = 1000000000;

    const lockedAmount = ONE_GWEI;
    const unlockedTime = (await time.latest()) + ONE_YEAR_IN_SECONDS;

    //Get hardhat Accounts
    const [owner,otherAccount] =await ethers.getSigners();
    // console.log(owner)
    // console.log(otherAccount)
    const mytest = await ethers.deployContract("MyTest",[unlockedTime],{value:lockedAmount});
    
    return {mytest, unlockedTime,lockedAmount,owner,otherAccount}
 }
 //loadFiture allows to run the function over and over again
 describe("deployment",function(){
    it("should check unlock time", async function(){
        const {mytest, unlockedTime}= await loadFixture(runEveryTime);
        expect(await mytest.unlockedTime()).to.equal(unlockedTime)
        // const ab= expect(await mytest.unlockedTime()).to.equal(unlockedTime)
        // console.log(ab)
    })
    //checking owner
    it("should check the owner",async function(){
        const {mytest, owner} = await loadFixture(runEveryTime);
        expect(await mytest.owner()).to.equal(owner.address)
    });
    //checking the balance

    it("should receive and store the funds to MyTest", async function(){
        const {mytest, lockedAmount} = await loadFixture(runEveryTime)

        // const contBalance = await ethers.provider.getBalance(mytest.target)
        expect(await ethers.provider.getBalance(mytest.target)).to.equal(lockedAmount);
       
       // console.log(contBalance)
        // console.log(lockedAmount) 
    });
    it("should fail if unlocked is not in the future",async function(){
        const latestTime = await time.latest();
       const MyTest = await ethers.getContractFactory("MyTest");
       await expect(MyTest.deploy(latestTime, {value:1})).to.be.revertedWith("Unlock time should be in future");

        // console.log(latestTime)
        
    });


 })
 describe("Withdrawals",function(){
    describe("Validations",function(){
        //Time check for withdrawal
        it("should revert with right if called too soon", async function(){
            const {mytest} =await loadFixture(runEveryTime);
            await expect(mytest.withdraw()).to.be.revertedWith("wait untill time period completed")
        });
        it("should revrt the message for right owner",async function(){
            const{mytest,unlockedTime,otherAccount}= await loadFixture(runEveryTime);
            //it check ,the time we provided is in the future
            //const newTime =await time.increaseTo(unlockedTime);
            await time.increaseTo(unlockedTime);
            await expect(mytest.connect(otherAccount).withdraw()).to.be.revertedWith("u r not Owner")

        });
        it("should not fail if unlocke time arrived if owner call",async function(){
            const {mytest,unlockedTime}= await loadFixture(runEveryTime);
            await time.increaseTo(unlockedTime);
            await expect(mytest.withdraw()).not.to.be.reverted;
        });
    });
    describe("Event",function(){
        //submit events
        it("should emit the event on withdrawal",async function(){
            const{mytest,unlockedTime,lockedAmount}= await loadFixture(runEveryTime);
            await time.increaseTo(unlockedTime);
            await expect(mytest.withdraw()).to.emit(mytest,"Withdrawal").withArgs(lockedAmount,anyValue);
        });

    });
    describe("Transfer",function(){
        it("Should transfer the funds to the owner",async function(){
            const {mytest,unlockedTime,lockedAmount,owner}= await loadFixture(runEveryTime);
            await time.increaseTo(unlockedTime);
            await expect(mytest.withdraw()).to.changeEtherBalance(
                [owner,mytest],
                [lockedAmount,-lockedAmount]
            )
        })
    })
 })
 runEveryTime()
})
