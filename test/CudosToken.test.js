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

contract('ERC20', function ([_, cudos, partner, anotherAccount, otherWhitelistAdmin, otherPartner, ...otherAccounts]) {

    const NAME = 'CudosToken';
    const SYMBOL = 'CUDOS';
    const DECIMALS = 18;
    const initialSupply = new BN(10000000000).mul(new BN(10).pow(new BN(DECIMALS)));

    const ONE_TOKEN = new BN(1).mul(new BN(10).pow(new BN(DECIMALS)));

    beforeEach(async function () {
        // cudos is added as a WhitelistedAdmin doing construction
        this.token = await CudosToken.new({from: cudos});

        await this.token.addWhitelistAdmin(otherWhitelistAdmin, {from: cudos});

        await this.token.addWhitelisted(cudos, {from: cudos});
        await this.token.addWhitelisted(partner, {from: cudos});
        await this.token.addWhitelisted(otherPartner, {from: cudos});
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
        const creatorBalance = await this.token.balanceOf(cudos);

        creatorBalance.should.be.bignumber.equal(totalSupply);

        await expectEvent.inConstruction(this.token, 'Transfer', {
            from: ZERO_ADDRESS,
            to: cudos,
            value: totalSupply,
        });
    });

    shouldBehaveLikeERC20('ERC20', initialSupply, cudos, partner, anotherAccount);

    describe('decrease allowance', function () {
        describe('when the spender is not the zero address', function () {
            const spender = partner;

            function shouldDecreaseApproval(amount) {
                describe('when there was no approved amount before', function () {
                    it('reverts', async function () {
                        await shouldFail.reverting.withMessage(this.token.decreaseAllowance(
                            spender, amount, {from: cudos}), 'SafeMath: subtraction overflow'
                        );
                    });
                });

                describe('when the spender had an approved amount', function () {
                    const approvedAmount = amount;

                    beforeEach(async function () {
                        ({logs: this.logs} = await this.token.approve(spender, approvedAmount, {from: cudos}));
                    });

                    it('emits an approval event', async function () {
                        const {logs} = await this.token.decreaseAllowance(spender, approvedAmount, {from: cudos});

                        expectEvent.inLogs(logs, 'Approval', {
                            owner: cudos,
                            spender: spender,
                            value: new BN(0),
                        });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await this.token.decreaseAllowance(spender, approvedAmount.subn(1), {from: cudos});

                        (await this.token.allowance(cudos, spender)).should.be.bignumber.equal('1');
                    });

                    it('sets the allowance to zero when all allowance is removed', async function () {
                        await this.token.decreaseAllowance(spender, approvedAmount, {from: cudos});
                        (await this.token.allowance(cudos, spender)).should.be.bignumber.equal('0');
                    });

                    it('reverts when more than the full allowance is removed', async function () {
                        await shouldFail.reverting.withMessage(
                            this.token.decreaseAllowance(spender, approvedAmount.addn(1), {from: cudos}),
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
                    spender, amount, {from: cudos}, 'ERC20: approve to the zero address')
                );
            });
        });
    });

    describe('increase allowance', function () {
        const amount = initialSupply;

        describe('when the spender is not the zero address', function () {
            const spender = partner;

            describe('when the sender has enough balance', function () {
                it('emits an approval event', async function () {
                    const {logs} = await this.token.increaseAllowance(spender, amount, {from: cudos});

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: cudos,
                        spender: spender,
                        value: amount,
                    });
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, {from: cudos});

                        (await this.token.allowance(cudos, spender)).should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), {from: cudos});
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, {from: cudos});

                        (await this.token.allowance(cudos, spender)).should.be.bignumber.equal(amount.addn(1));
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = initialSupply.addn(1);

                it('emits an approval event', async function () {
                    const {logs} = await this.token.increaseAllowance(spender, amount, {from: cudos});

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: cudos,
                        spender: spender,
                        value: amount,
                    });
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, {from: cudos});

                        (await this.token.allowance(cudos, spender)).should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), {from: cudos});
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, {from: cudos});

                        (await this.token.allowance(cudos, spender)).should.be.bignumber.equal(amount.addn(1));
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
            const spender = ZERO_ADDRESS;

            it('reverts', async function () {
                await shouldFail.reverting.withMessage(
                    this.token.increaseAllowance(spender, amount, {from: cudos}), 'ERC20: approve to the zero address'
                );
            });
        });
    });

    describe('_transfer', function () {
        shouldBehaveLikeERC20Transfer('ERC20', cudos, partner, initialSupply, function (from, to, amount) {
            return this.token.transfer(to, amount, {from: cudos});
        });

        it('reverts as not authorised to transfer via whitelist', async function () {
            await this.token.transfer(anotherAccount, ONE_TOKEN, {from: cudos}); // ensure anotherAccount has a balance

            (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal(ONE_TOKEN);

            await shouldFail.reverting.withMessage(
                this.token.transfer(cudos, ONE_TOKEN, {from: anotherAccount}), 'Caller can not currently transfer'
            );
        });
    });

    describe('_transferFrom', function () {
        it('reverts as not authorised to transferFrom via whitelist', async function () {
            await this.token.transfer(anotherAccount, ONE_TOKEN, {from: cudos}); // ensure anotherAccount has a balance

            (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal(ONE_TOKEN);

            await shouldFail.reverting.withMessage(
                this.token.transferFrom(anotherAccount, cudos, ONE_TOKEN, {from: anotherAccount}), 'Caller can not currently transfer'
            );
        });

        it('transferFrom via whitelisted caller (who has been approved the required allowance)', async function () {
            await this.token.transfer(anotherAccount, ONE_TOKEN, {from: cudos}); // ensure anotherAccount has a balance

            await this.token.approve(partner, ONE_TOKEN, {from: anotherAccount});
            (await this.token.allowance(anotherAccount, partner)).should.be.bignumber.equal(ONE_TOKEN);

            // partner can send tokens as whitelisted and approved
            await this.token.transferFrom(anotherAccount, cudos, 1, {from: partner});
        });
    });

    describe('_approve', function () {
        shouldBehaveLikeERC20Approve('ERC20', cudos, partner, initialSupply, function (owner, spender, amount) {
            return this.token.approve(spender, amount, {from: cudos});
        });
    });

    // WhitelistAdmin
    shouldBehaveLikePublicRole(cudos, otherWhitelistAdmin, otherAccounts, 'WhitelistAdmin');

    describe('whitelist admin access control via modifier', function () {
        context('from authorized account', function () {
            const from = cudos;

            it('allows access', async function () {
                await this.token.enableTransfers({from});
            });
        });

        context('from unauthorized account', function () {
            const from = partner;

            it('reverts', async function () {
                await shouldFail.reverting.withMessage(this.token.enableTransfers({from}),
                    `WhitelistAdminRole: caller does not have the WhitelistAdmin role`
                );
            });
        });
    });

    // Whitelisted
    shouldBehaveLikePublicRole(partner, otherPartner, otherAccounts, 'Whitelisted', cudos);

    describe('remove whitelised role', function () {
        const rolename = 'Whitelisted';
        const from = cudos;

        context(`from cudos account`, function () {
            it('removes role from an already assigned account', async function () {
                await this.token[`remove${rolename}`](partner, {from});
                (await this.token[`is${rolename}`](partner)).should.equal(false);
                (await this.token[`is${rolename}`](otherPartner)).should.equal(true);
            });

            it(`emits a ${rolename}Removed event`, async function () {
                const {logs} = await this.token[`remove${rolename}`](partner, {from});
                expectEvent.inLogs(logs, `${rolename}Removed`, {account: partner});
            });

            it('reverts when removing from an unassigned account', async function () {
                await shouldFail.reverting.withMessage(this.token[`remove${rolename}`](anotherAccount, {from}),
                    'Roles: account does not have role'
                );
            });

            it('reverts when removing role from the null account', async function () {
                await shouldFail.reverting.withMessage(this.token[`remove${rolename}`](ZERO_ADDRESS, {from}),
                    'Roles: account is the zero address'
                );
            });
        });
    });
});
