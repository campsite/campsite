# frozen_string_literal: true

class PostTagging < ApplicationRecord
  belongs_to :tag
  belongs_to :post
  counter_culture :tag, column_name: :posts_count

  validate :uniquess_of_post_tagging
  validate :ensure_post_tag_limit

  private

  def uniquess_of_post_tagging
    return unless tag && post
    return unless self.class.exists?(tag: tag, post: post)

    errors.add(:post, "has already been tagged with #{tag.name}")
  end

  def ensure_post_tag_limit
    return unless post
    return if post.tags.count < Post::POST_TAG_LIMIT

    errors.add(:post, "can have a max of #{Post::POST_TAG_LIMIT} tags")
  end
end
