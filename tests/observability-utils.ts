import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  CloneDeployed,
  ContentDigestAdded,
  ContentDigestRemoved,
  FactoryImplementationSet,
  PlatformMetadataDigestSet,
  RoleSet
} from "../generated/Observability/Observability"

export function createCloneDeployedEvent(
  factory: Address,
  owner: Address,
  clone: Address
): CloneDeployed {
  let cloneDeployedEvent = changetype<CloneDeployed>(newMockEvent())

  cloneDeployedEvent.parameters = new Array()

  cloneDeployedEvent.parameters.push(
    new ethereum.EventParam("factory", ethereum.Value.fromAddress(factory))
  )
  cloneDeployedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  cloneDeployedEvent.parameters.push(
    new ethereum.EventParam("clone", ethereum.Value.fromAddress(clone))
  )

  return cloneDeployedEvent
}

export function createContentDigestAddedEvent(
  clone: Address,
  digest: Bytes,
  owner: Address
): ContentDigestAdded {
  let contentDigestAddedEvent = changetype<ContentDigestAdded>(newMockEvent())

  contentDigestAddedEvent.parameters = new Array()

  contentDigestAddedEvent.parameters.push(
    new ethereum.EventParam("clone", ethereum.Value.fromAddress(clone))
  )
  contentDigestAddedEvent.parameters.push(
    new ethereum.EventParam("digest", ethereum.Value.fromFixedBytes(digest))
  )
  contentDigestAddedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return contentDigestAddedEvent
}

export function createContentDigestRemovedEvent(
  clone: Address,
  digest: Bytes
): ContentDigestRemoved {
  let contentDigestRemovedEvent = changetype<ContentDigestRemoved>(
    newMockEvent()
  )

  contentDigestRemovedEvent.parameters = new Array()

  contentDigestRemovedEvent.parameters.push(
    new ethereum.EventParam("clone", ethereum.Value.fromAddress(clone))
  )
  contentDigestRemovedEvent.parameters.push(
    new ethereum.EventParam("digest", ethereum.Value.fromFixedBytes(digest))
  )

  return contentDigestRemovedEvent
}

export function createFactoryImplementationSetEvent(
  factory: Address,
  oldImplementation: Address,
  newImplementation: Address
): FactoryImplementationSet {
  let factoryImplementationSetEvent = changetype<FactoryImplementationSet>(
    newMockEvent()
  )

  factoryImplementationSetEvent.parameters = new Array()

  factoryImplementationSetEvent.parameters.push(
    new ethereum.EventParam("factory", ethereum.Value.fromAddress(factory))
  )
  factoryImplementationSetEvent.parameters.push(
    new ethereum.EventParam(
      "oldImplementation",
      ethereum.Value.fromAddress(oldImplementation)
    )
  )
  factoryImplementationSetEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return factoryImplementationSetEvent
}

export function createPlatformMetadataDigestSetEvent(
  clone: Address,
  platformMetadataDigest: Bytes
): PlatformMetadataDigestSet {
  let platformMetadataDigestSetEvent = changetype<PlatformMetadataDigestSet>(
    newMockEvent()
  )

  platformMetadataDigestSetEvent.parameters = new Array()

  platformMetadataDigestSetEvent.parameters.push(
    new ethereum.EventParam("clone", ethereum.Value.fromAddress(clone))
  )
  platformMetadataDigestSetEvent.parameters.push(
    new ethereum.EventParam(
      "platformMetadataDigest",
      ethereum.Value.fromFixedBytes(platformMetadataDigest)
    )
  )

  return platformMetadataDigestSetEvent
}

export function createRoleSetEvent(
  clone: Address,
  account: Address,
  role: Bytes,
  granted: boolean
): RoleSet {
  let roleSetEvent = changetype<RoleSet>(newMockEvent())

  roleSetEvent.parameters = new Array()

  roleSetEvent.parameters.push(
    new ethereum.EventParam("clone", ethereum.Value.fromAddress(clone))
  )
  roleSetEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleSetEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleSetEvent.parameters.push(
    new ethereum.EventParam("granted", ethereum.Value.fromBoolean(granted))
  )

  return roleSetEvent
}
