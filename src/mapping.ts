import { BigInt } from "@graphprotocol/graph-ts"
import { Transfer as TransferEvent } from "../generated/NFTCollection/NFT"
import { Account, Token } from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {
    let tokenId = event.params.tokenId.toString();
    let newOwnerAddress = event.params.to.toHex();
    let previousOwnerAddress = event.params.from.toHex();
  
    // Load or create the Token entity
    let token = Token.load(tokenId);
    if (!token) {
      token = new Token(tokenId);
      token.transferCount = BigInt.fromI32(0);
    }
  
    // Update the token's owner and transfer count
    token.owner = newOwnerAddress;
    token.transferCount = token.transferCount.plus(BigInt.fromI32(1));
    token.save();
  
    // Load or create the new owner's Account entity
    let newOwner = Account.load(newOwnerAddress);
    if (!newOwner) {
      newOwner = new Account(newOwnerAddress);
      newOwner.tokensOwned = BigInt.fromI32(0);
    }
    newOwner.tokensOwned = newOwner.tokensOwned.plus(BigInt.fromI32(1));
    newOwner.save();
  
    // Update the previous owner's Account entity, if not the zero address
    if (previousOwnerAddress != "0x0000000000000000000000000000000000000000") {
      let previousOwner = Account.load(previousOwnerAddress);
      if (previousOwner) {
        previousOwner.tokensOwned = previousOwner.tokensOwned.minus(BigInt.fromI32(1));
        previousOwner.save();
      }
    }
  }