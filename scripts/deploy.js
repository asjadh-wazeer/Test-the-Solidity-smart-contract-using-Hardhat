const hre = require("hardhat");
// console.log(hre);

async function main() {
    const currentTimestampInSeconds = Math.round(Math.round(Date.now() / 1000));
    const ONE_YEARS_IN_SECONDS = 356 * 24 * 60 * 60;
    const unlockedTime = currentTimestampInSeconds + ONE_YEARS_IN_SECONDS;
    const lockedAmount = hre.ethers.utils.parseEther("1");

    // console.log({currentTimestampInSeconds,ONE_YEARS_IN_SECONDS,unlockedTime, lockedAmount})

    const MyTest = await hre.ethers.getContractFactory("MyTest");
    const myTest = await MyTest.deploy(unlockedTime, {value: lockedAmount});

    await myTest.deployed();
    console.log("🔥", myTest)
    console.log(`Contract contain 1 ETH & address: ${myTest.address}`)
}

main().catch((error)=>{
    console.log("main",error);
    process.exitCode = 1;
})