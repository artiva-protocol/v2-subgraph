import {
  CloneDeployed,
  ContentSet,
  FactoryImplementationSet,
  PlatformMetadataSet,
  RoleSet,
} from "../generated/Observability/Observability";
import { Platform, Post, Bundle, PlatformUser, Tag } from "../generated/schema";
import { json, store, JSONValueKind } from "@graphprotocol/graph-ts";

export function handleCloneDeployed(event: CloneDeployed): void {
  let platform = new Platform(event.params.clone.toHex());
  platform.metadataUpdatedTimestamp = event.block.timestamp.toString();
  platform.deployedAtTimestamp = event.block.timestamp.toString();

  platform.save();
}

export function handleContentSet(event: ContentSet): void {
  let clone = event.params.clone.toHex();
  let bundleId = event.params.bundleId.toHex();

  //Check if bundle JSON is formatted properly
  let rawBundle = json.try_fromString(event.params.bundleJSON);
  if (rawBundle.isError || rawBundle.value.kind !== JSONValueKind.ARRAY) return;

  let bundle = Bundle.load(event.params.bundleId.toHex());
  if (bundle) {
    //Clear previous posts
    for (let i = 0; i < bundle.length; i++) {
      let postId = clone + ":" + bundleId + ":" + i.toString();
      store.remove("Post", postId);
    }
  } else {
    bundle = new Bundle(bundleId);
  }

  let bundleArray = rawBundle.value.toArray();
  let bundleLength = 0;

  //Get content from bundle
  for (let i = 0; i < bundleArray.length; i++) {
    //if json is not formatted properly skip this entry
    if (bundleArray[i].kind !== JSONValueKind.OBJECT) continue;
    let rawContent = bundleArray[i].toObject();

    //if required properties are not set skip this entry
    if (
      !rawContent.isSet("id") ||
      !rawContent.isSet("type") ||
      !rawContent.isSet("contentJSON")
    )
      continue;

    //Create post object
    let postId = clone + ":" + bundleId + ":" + bundleLength.toString();
    let content = new Post(postId);

    //Handle tags
    let tagIds: string[] = [];
    if (rawContent.isSet("tags")) {
      let tagString = rawContent.mustGetEntry("tags").value.toString();
      let tagArray = tagString.split("|");
      for (let i = 0; i < tagArray.length; i++) {
        let tagId = `${clone}:${tagArray[i]}`;

        let tag = new Tag(tagId);
        tag.name = tagArray[i];
        tag.platform = clone;
        tag.save();

        tagIds.push(tagId);
      }
    }

    content.postId = rawContent.mustGetEntry("id").value.toString();
    content.contentJSON = rawContent
      .mustGetEntry("contentJSON")
      .value.toString();
    content.type = rawContent.mustGetEntry("type").value.toString();

    content.tags = tagIds;
    content.bundle = event.params.bundleId.toHex();
    content.platform = clone;
    content.owner = `${clone}:${event.params.owner.toHex()}`;
    content.setAtTimestamp = event.block.timestamp.toString();
    content.save();

    bundleLength++;
  }

  bundle.length = bundleLength;
  bundle.save();

  let platform = new Platform(event.params.clone.toHex());
  platform.contentAddedTimestamp = event.block.timestamp.toString();
  platform.save();
}

export function handlePlatformMetadataSet(event: PlatformMetadataSet): void {
  let platform = new Platform(event.params.clone.toHex());
  platform.metadataJSON = event.params.metadataJSON;
  platform.metadataUpdatedTimestamp = event.block.timestamp.toString();
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
