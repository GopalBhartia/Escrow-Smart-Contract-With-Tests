const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow Smart Contract", function () {
  let lawyer, payer, payee;

  beforeEach(async function () {
    [lawyer, payer, payee] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory("Escrow", lawyer);
    this.escrow = await Escrow.deploy(payer.address, payee.address, ethers.utils.parseEther("5"));
  });

  describe("Deposit Function", function () {
    it("Should allow Payer to deposit the amount", async function () {
      await this.escrow.connect(payer).deposit({ value: ethers.utils.parseEther("5") });
      const escrowBalance = await this.escrow.balanceOf();
      expect(escrowBalance).to.eq(ethers.utils.parseEther("5"));
    });
    it("Should NOT deposit if sender is not Payer", async function () {
      await expect(this.escrow.connect(payee).deposit({ value: ethers.utils.parseEther("5") })).to.be.revertedWith("Only Payer can deposit the funds");
    });
    it("Should NOT deposit more than amount", async function () {
      await expect(this.escrow.connect(payer).deposit({ value: ethers.utils.parseEther("10") })).to.be.revertedWith("Cant send more than escrow amount");
    });
  });
  describe("Rlease Function", function () {
    it("Should allow Lawyer to release funds", async function () {
      const payeeBeforeBalance = ethers.BigNumber.from(await ethers.provider.getBalance(payee.address));
      //console.log("Payee balance before release :", payeeBeforeBalance);
      await this.escrow.connect(payer).deposit({ value: ethers.utils.parseEther("5") });
      await this.escrow.connect(lawyer).release();
      const payeeAfterBalance = ethers.BigNumber.from(await ethers.provider.getBalance(payee.address));
      //console.log("Payee balance after release :", payeeAfterBalance);
      expect(payeeAfterBalance.sub(payeeBeforeBalance) === ethers.BigNumber.from(ethers.utils.parseEther("5")));
    });
    it("Should NOT allow Lawyer to release funds if amount not reached", async function () {
      await expect(this.escrow.connect(lawyer).release()).to.be.revertedWith("Insufficient funds for release");

      await this.escrow.connect(payer).deposit({ value: ethers.utils.parseEther("3") });
      await expect(this.escrow.connect(lawyer).release()).to.be.revertedWith("Insufficient funds for release");
    });
    it("Should NOT allow others to release funds", async function () {
      await this.escrow.connect(payer).deposit({ value: ethers.utils.parseEther("5") });
      await expect(this.escrow.connect(payee).release()).to.be.revertedWith("only Lawyer can release the funds");
    });
  });
});