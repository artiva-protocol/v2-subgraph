import {
  CloneDeployed,
  ContentDigestAdded,
  ContentDigestRemoved,
  FactoryImplementationSet,
  PlatformMetadataDigestSet,
  RoleSet,
} from "../generated/Observability/Observability";
import { Platform, ContentDigest, PlatformUser } from "../generated/schema";

export function handleCloneDeployed(event: CloneDeployed): void {
  let platform = new Platform(event.params.clone.toHex());
  platform.metadataDigestUpdatedTimestamp = event.block.timestamp.toString();
  platform.deployedAtTimestamp = event.block.timestamp.toString();

  platform.save();
}

export function handleContentDigestAdded(event: ContentDigestAdded): void {
  let contentDigest = new ContentDigest(event.params.digest.toBase58());

  contentDigest.platform = event.params.clone.toHex();
  contentDigest.owner = event.params.owner.toHex();
  contentDigest.addedAtTimestamp = event.block.timestamp.toString();
  contentDigest.removedAtTimestamp = null;
  contentDigest.status = "CURATED";
  contentDigest.save();

  let platform = new Platform(event.params.clone.toHex());
  platform.contentAddedTimestamp = event.block.timestamp.toString();
  platform.save();
}

export function handleContentDigestRemoved(event: ContentDigestRemoved): void {
  let contentDigest = new ContentDigest(event.params.digest.toBase58());
  contentDigest.removedAtTimestamp = event.block.timestamp.toString();
  contentDigest.status = "REMOVED";
  contentDigest.save();
}

export function handlePlatformMetadataDigestSet(
  event: PlatformMetadataDigestSet
): void {
  let platform = new Platform(event.params.clone.toHex());
  platform.platformMetadataDigest = event.params.platformMetadataDigest;
  platform.metadataDigestUpdatedTimestamp = event.block.timestamp.toString();
  platform.save();
}

export function handleRoleSet(event: RoleSet): void {
  let user = PlatformUser.load(event.params.account.toHex());
  if (!user) {
    user = new PlatformUser(event.params.account.toHex());
    user.admin = false;
    user.contentPublisher = false;
    user.metadataManager = false;
  }

  let admin =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  let contentPublisher =
    "0xbe2fbcab6b03dc42158993aa7c9e7b92519cf9abefeafb3902d8cc76e7dd14ed";
  let metadataManager =
    "0x21e141d29efe528175baa3d6b347407f49288a1a3c0aebcc3160cd2b50b2a9c1";

  let granted = event.params.granted;

  if (event.params.role.toHex() == admin) user.admin = granted;
  if (event.params.role.toHex() == contentPublisher)
    user.contentPublisher = granted;
  if (event.params.role.toHex() == metadataManager)
    user.metadataManager = granted;

  user.platform = event.params.clone.toHex();

  user.save();
}

export function handleFactoryImplementationSet(
  event: FactoryImplementationSet
): void {}
