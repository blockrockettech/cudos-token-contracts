const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const {ZERO_ADDRESS} = constants;

const should = require('chai').should();

const {
    shouldBehaveLikeERC20,
    shouldBehaveLikeERC20Transfer,
    shouldBehaveLikeERC20Approve,
} = require('./ERC20.behavior');

const {shouldBehaveLikePublicRole} = require('./PublicRole.behavior');

const CudosToken = artifacts.require('CudosToken');

contract('ERC20', function ([_, initialHolder, recipient, anotherAccount, otherWhitelistAdmin, whitelisted, otherWhitelisted, ...otherAccounts]) {

    const NAME = 'CudosToken';
    const SYMBOL = 'CUDOS';
    const DECIMALS = 18;
    const initialSupply = new BN(10000000000).mul(new BN(10).pow(new BN(DECIMALS)));

    beforeEach(async function () {
        this.token = await CudosToken.new({from: initialHolder});

        await this.token.addWhitelistAdmin(otherWhitelistAdmin, {from: initialHolder});

        await this.token.addWhitelisted(whitelisted, {from: initialHolder});
        await this.token.addWhitelisted(otherWhitelisted, {from: initialHolder});
    });

    it('has a name', async function () {
        (await this.token.name()).should.equal(NAME);
    });

    it('has a symbol', async function () {
        (await this.token.symbol()).should.equal(SYMBOL);
    });

    it('has 18 decimals', async function () {
        (await this.token.decimals()).should.be.bignumber.equal('18');
    });

    it('assigns the initial total supply to the creator', async function () {
        const totalSupply = await this.token.totalSupply();
        const creatorBalance = await this.token.balanceOf(initialHolder);

        creatorBalance.should.be.bignumber.equal(totalSupply);

        await expectEvent.inConstruction(this.token, 'Transfer', {
            from: ZERO_ADDRESS,
            to: initialHolder,
            value: totalSupply,
        });
    });

    shouldBehaveLikeERC20('ERC20', initialSupply, initialHolder, recipient, anotherAccount);

    describe('decrease allowance', function () {
        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            function shouldDecreaseApproval(amount) {
                describe('when there was no approved amount before', function () {
                    it('reverts', async function () {
                        await shouldFail.reverting.withMessage(this.token.decreaseAllowance(
                            spender, amount, {from: initialHolder}), 'SafeMath: subtraction overflow'
                        );
                    });
                });

                describe('when the spender had an approved amount', function () {
                    const approvedAmount = amount;

                    beforeEach(async function () {
                        ({logs: this.logs} = await this.token.approve(spender, approvedAmount, {from: initialHolder}));
                    });

                    it('emits an approval event', async function () {
                        const {logs} = await this.token.decreaseAllowance(spender, approvedAmount, {from: initialHolder});

                        expectEvent.inLogs(logs, 'Approval', {
                            owner: initialHolder,
                            spender: spender,
                            value: new BN(0),
                        });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await this.token.decreaseAllowance(spender, approvedAmount.subn(1), {from: initialHolder});

                        (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('1');
                    });

                    it('sets the allowance to zero when all allowance is removed', async function () {
                        await this.token.decreaseAllowance(spender, approvedAmount, {from: initialHolder});
                        (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('0');
                    });

                    it('reverts when more than the full allowance is removed', async function () {
                        await shouldFail.reverting.withMessage(
                            this.token.decreaseAllowance(spender, approvedAmount.addn(1), {from: initialHolder}),
                            'SafeMath: subtraction overflow'
                        );
                    });
                });
            }

            describe('when the sender has enough balance', function () {
                const amount = initialSupply;

                shouldDecreaseApproval(amount);
            });

            describe('when the sender does not have enough balance', function () {
                const amount = initialSupply.addn(1);

                shouldDecreaseApproval(amount);
            });
        });

        describe('when the spender is the zero address', function () {
            const amount = initialSupply;
            const spender = ZERO_ADDRESS;

            it('reverts', async function () {
                await shouldFail.reverting.withMessage(this.token.decreaseAllowance(
                    spender, amount, {from: initialHolder}, 'ERC20: approve to the zero address')
                );
            });
        });
    });

    describe('increase allowance', function () {
        const amount = initialSupply;

        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                it('emits an approval event', async function () {
                    const {logs} = await this.token.increaseAllowance(spender, amount, {from: initialHolder});

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: initialHolder,
                        spender: spender,
                        value: amount,
                    });
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, {from: initialHolder});

                        (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), {from: initialHolder});
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, {from: initialHolder});

                        (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount.addn(1));
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = initialSupply.addn(1);

                it('emits an approval event', async function () {
                    const {logs} = await this.token.increaseAllowance(spender, amount, {from: initialHolder});

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: initialHolder,
                        spender: spender,
                        value: amount,
                    });
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, {from: initialHolder});

                        (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), {from: initialHolder});
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, {from: initialHolder});

                        (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount.addn(1));
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
            const spender = ZERO_ADDRESS;

            it('reverts', async function () {
                await shouldFail.reverting.withMessage(
                    this.token.increaseAllowance(spender, amount, {from: initialHolder}), 'ERC20: approve to the zero address'
                );
            });
        });
    });

    describe('_transfer', function () {
        shouldBehaveLikeERC20Transfer('ERC20', initialHolder, recipient, initialSupply, function (from, to, amount) {
            return this.token.transfer(to, amount, {from: initialHolder});
        });
    });

    describe('_approve', function () {
        shouldBehaveLikeERC20Approve('ERC20', initialHolder, recipient, initialSupply, function (owner, spender, amount) {
            return this.token.approve(spender, amount, {from: initialHolder});
        });
    });

    // WhitelistAdmin
    shouldBehaveLikePublicRole(initialHolder, otherWhitelistAdmin, otherAccounts, 'WhitelistAdmin');

    describe('whitelist admin access control via modifier', function () {
        context('from authorized account', function () {
            const from = initialHolder;

            it('allows access', async function () {
                await this.token.enableTransfers({from});
            });
        });

        context('from unauthorized account', function () {
            const from = recipient;

            it('reverts', async function () {
                await shouldFail.reverting.withMessage(this.token.enableTransfers({from}),
                    `WhitelistAdminRole: caller does not have the WhitelistAdmin role`
                );
            });
        });
    });

    // Whitelisted
    shouldBehaveLikePublicRole(whitelisted, otherWhitelisted, otherAccounts, 'Whitelisted', initialHolder);
});
