import {
  CloneDeployed,
  ContentRemoved,
  ContentSet,
  FactoryImplementationSet,
  PlatformMetadataSet,
  RoleSet,
} from "../generated/Observability/Observability";
import { Platform, Post, PlatformUser, Tag } from "../generated/schema";
import { json, JSONValueKind, store } from "@graphprotocol/graph-ts";

export function handleCloneDeployed(event: CloneDeployed): void {
  let platform = new Platform(event.params.clone.toHex());
  platform.metadataUpdatedTimestamp = event.block.timestamp.toString();
  platform.deployedAtTimestamp = event.block.timestamp.toString();

  platform.save();
}

export function handleContentSet(event: ContentSet): void {
  let clone = event.params.clone.toHex();
  let contentId = event.params.contentId.toHex();
  let postId = `${clone}:${contentId}`;

  let post = Post.load(postId);
  if (!post) {
    post = new Post(postId);
    post.order = event.params.contentId.toI32();
  }

  post.contentJSON = event.params.content;

  //Check if content JSON is formatted properly
  let rawJSON = json.try_fromString(event.params.content);
  if (rawJSON.isError || rawJSON.value.kind !== JSONValueKind.OBJECT) return;

  let rawContent = rawJSON.value.toObject();

  //if required properties are not set skip this entry
  if (!rawContent.isSet("type") || !rawContent.isSet("contentJSON")) return;

  //Handle tags
  let tagIds: string[] = [];
  if (rawContent.isSet("tags")) {
    //Parse and split tags
    let tagString = rawContent.mustGetEntry("tags").value.toString();
    let tagArray = tagString.split("|");

    //Create tag objects
    for (let i = 0; i < tagArray.length; i++) {
      let tagId = `${clone}:${tagArray[i]}`;

      let tag = new Tag(tagId);
      tag.name = tagArray[i];
      tag.platform = clone;
      tag.save();

      tagIds.push(tagId);
    }
  }

  //JSON properties
  post.contentId = contentId;
  post.contentJSON = rawContent.mustGetEntry("contentJSON").value.toString();
  post.type = rawContent.mustGetEntry("type").value.toString();

  //Meta properties
  post.tags = tagIds;
  post.platform = clone;
  post.owner = `${clone}:${event.params.owner.toHex()}`;
  post.setAtTimestamp = event.block.timestamp.toString();
  post.save();

  let platform = new Platform(event.params.clone.toHex());
  platform.contentAddedTimestamp = event.block.timestamp.toString();
  platform.save();
}

export function handleContentRemoved(event: ContentRemoved): void {
  let id = `${event.params.clone.toHex()}:${event.params.contentId.toHex()}`;
  store.remove("Post", id);
}

export function handlePlatformMetadataSet(event: PlatformMetadataSet): void {
  let address = event.params.clone.toHex();
  let platform = new Platform(address);

  let rawJSON = json.try_fromString(event.params.metadata);
  if (rawJSON.isError || rawJSON.value.kind !== JSONValueKind.OBJECT) return;

  let rawMeta = rawJSON.value.toObject();

  //Handle post ordering
  if (rawMeta.isSet("order")) {
    let order = rawMeta.mustGetEntry("order");
    let orderArray = order.value.toArray();

    for (let i = 0; i < orderArray.length; i++) {
      if (orderArray[i].kind !== JSONValueKind.OBJECT) break;

      //Parse order object
      let orderValue = orderArray[i].toObject();
      let post = Post.load(
        `${address}:${orderValue.mustGet("postId").toString()}`
      );

      //Set post order if it exists
      if (!post) break;

      //Parse order and cast to i32 for gql compatibility
      post.order = i32(orderValue.mustGet("order").toI64());

      post.save();
    }
  }

  platform.metadataJSON = event.params.metadata;
  platform.metadataUpdatedTimestamp = event.block.timestamp.toString();
  platform.save();
}

export function handleRoleSet(event: RoleSet): void {
  const userId = `${event.params.clone.toHex()}:${event.params.account.toHex()}`;

  let user = PlatformUser.load(userId);
  if (!user) {
    user = new PlatformUser(userId);
    user.user = event.params.account;
    user.platform = event.params.clone.toHex();
  }

  switch (event.params.role) {
    case 0:
      user.role = "UNAUTHORIZED";
      break;
    case 1:
      user.role = "PUBLISHER";
      break;
    case 2:
      user.role = "MANAGER";
      break;
    case 3:
      user.role = "ADMIN";
      break;
  }

  user.save();
}

export function handleFactoryImplementationSet(
  event: FactoryImplementationSet
): void {}
