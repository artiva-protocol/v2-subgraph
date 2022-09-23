import {
  CloneDeployed,
  ContentSet,
  FactoryImplementationSet,
  PlatformMetadataURISet,
  RoleSet,
} from "../generated/Observability/Observability";
import { Platform, Content, PlatformUser } from "../generated/schema";

export function handleCloneDeployed(event: CloneDeployed): void {
  let platform = new Platform(event.params.clone.toHex());
  platform.metadataDigestUpdatedTimestamp = event.block.timestamp.toString();
  platform.deployedAtTimestamp = event.block.timestamp.toString();

  platform.save();
}

export function handleContentSet(event: ContentSet): void {
  let content = new Content(
    event.params.clone.toHex() + ":" + event.params.contentId.toHex()
  );

  content.contentId = event.params.contentId.toHex();
  content.uri = event.params.contentURI;
  content.platform = event.params.clone.toHex();
  content.owner = `${event.params.clone.toHex()}:${event.params.owner.toHex()}`;
  content.setAtTimestamp = event.block.timestamp.toString();
  content.save();

  let platform = new Platform(event.params.clone.toHex());
  platform.contentAddedTimestamp = event.block.timestamp.toString();
  platform.save();
}

export function handlePlatformMetadataURISet(
  event: PlatformMetadataURISet
): void {
  let platform = new Platform(event.params.clone.toHex());
  platform.metadataURI = event.params.metadataURI;
  platform.metadataDigestUpdatedTimestamp = event.block.timestamp.toString();
  platform.save();
}

export function handleRoleSet(event: RoleSet): void {
  const userId = `${event.params.clone.toHex()}:${event.params.account.toHex()}`;

  let user = PlatformUser.load(userId);
  if (!user) {
    user = new PlatformUser(userId);
    user.user = event.params.account;
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
