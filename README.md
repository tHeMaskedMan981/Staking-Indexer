# Staking Indexer 


We have created an optimized Staking Indexer, which takes funds in any token, divides the funds into parts, deposit them into Liquid Staking Protocols Lido and ClayStack, and deposit the liquid staking tokens stETH and csMatic into **BentoBox** to earn extra yields. 

We also provide easy to use rebalancing feature to convert stETH into csMatic, which involves withdrawing from bentoBox, converting stETH-> ETH -> Matic, depositing the matic into ClayStack, and depositing the csMatic tokens back in BentoBox. 





***Note*** : As it was difficult to find all the contracts on a single test network, we performed tests on Mainnet using Hardhat to fork mainnet. We used **Infura** archive RPC url to achieve that.