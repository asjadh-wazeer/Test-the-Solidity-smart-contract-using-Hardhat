const {time, loadFixture} = require("@nomicfoundation/hardhat-network-helpers");

// console.log({time, loadFixture})
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers");
// console.log(anyValue)

const {expect} =require("chai");
const {ethers} =require("hardhat");

// console.log({expect, ethers})
describe("MyTest", function(){
    async function runEveryTime() {
        const ONE_YEARS_IN_SECONDS = 356 * 24 * 60 * 60;
        const ONE_GEWI = 1000000000;

        const lockedAmount = ONE_GEWI;
        const unlockedTime = (await time.latest()) + ONE_YEARS_IN_SECONDS;

        // console.log({unlockedTime})

        const [owner, otherAccount] = await ethers.getSigners();
        // console.log({owner, otherAccount})

        const MyTest = await ethers.getContractFactory("MyTest");
        const myTest = await MyTest.deploy(unlockedTime, {value: lockedAmount});

        // console.log({MyTest, myTest})
        return {myTest, unlockedTime, lockedAmount, owner, otherAccount};
    }

    describe("Deployment", function() {
        //CHECKING UNLOCKED TIME
        it("Should check unlocked time",  async function() {
            const {myTest, unlockedTime} = await loadFixture(runEveryTime);

            // console.log({myTest, unlockedTime})
            expect(await myTest.unlockedTime()).to.equal(unlockedTime);
            // const ab = expect(await myTest.unlockedTime()).to.equal(unlockedTime);
            // console.log(ab)
        })


    //CHECKING OWNER
    it("Should set the right owner", async function() {
        const {myTest,owner} = await loadFixture(runEveryTime);
        expect(await myTest.owner()).to.equal(owner.address);
    })

    //CHECKING THE BALANCE
    it("Should receive and store the funds to myStore", async function() {
        const {myTest,lockedAmount} = await loadFixture(runEveryTime);
        // console.log(lockedAmount)
        // const contractBal = await ethers.provider.getBalance(myTest.address);
        // console.log(contractBal, ":🔥:",contractBal.toNumber())

        expect(await ethers.provider.getBalance(myTest.address)).to.equal(lockedAmount);
    });


    //CONDITION CHECK
    it("Should fail if unlocked is not in the future", async function() {
        const latestTime = await time.latest();
        console.log(latestTime/60/60/60/24);

        const MyTest = await ethers.getContractFactory("MyTest");
        // console.log("MyTest", MyTest)
        await expect(MyTest.deploy(latestTime, {value:1})).to.be.revertedWith("unlocked time should be in future")
    })

    })

    describe("Withdrawals", function(){
        describe("Validations", function(){
            //Time check for withdrawals
            //We allow only the owner to withdraw when the time is in the future and after one year
            it("Should revert with the right if called to soon", async function() {
                const {myTest} = await loadFixture(runEveryTime);

                await expect(myTest.withdraw()).to.be.revertedWith("wait till the time period completed")
            })

            it("Should revert the message for right owner", async function() {
                const {myTest, unlockedTime, otherAccount} = await loadFixture(runEveryTime);

                const newTime = await time.increaseTo(unlockedTime);
                // console.log(newTime)

                await expect(myTest.connect(otherAccount).withdraw()).to.be.revertedWith("You are not an owner")
            })

            it("Should not fail if the unlockedTime has arrived and the owner calls it", async function() {
                const {myTest, unlockedTime} = await loadFixture(runEveryTime);

                await time.increaseTo(unlockedTime);
                await expect(myTest.withdraw()).not.to.be.revertedWith;
            })
        })
    
    })

//Check for events
    describe("EVENTS", function(){
        //Submit events
        it("Should emit the event on withdrawals"), async function() {
            const {myTest, unlockedTime,lockedAmount} = await loadFixture(runEveryTime);
            await time.increaseTo(unlockedTime);
            await expect(myTest.withdraw()).to.emit(myTest, "Withdrawal").withArgs(lockedAmount,anyValue)
        }
    })

//Transfer
describe("Transfer", function() {
    it("Should transfer the fund to the owner"), async function(){
        const {myTest, unlockedTime, otherAccount, owner} = await loadFixture(runEveryTime);
        await time.increaseTo(unlockedTime);
        await expect(myTest.withdraw()).to.changeEtherBalances([owner, myTest],[lockedAmount, -lockedAmount])

    }
})

    runEveryTime();


})