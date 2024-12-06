# frozen_string_literal: true

class Feed
  def initialize(post)
    @post = post
  end

  def root_post
    @root_post ||= if @post.parent
      @post.root
    end
  end

  def latest_post
    @latest_post ||= @post
  end

  def id
    @post.public_id
  end

  def <=>(other)
    sort_value <=> other.sort_value
  end

  def sort_value
    return latest_post.created_at if latest_post

    root_post.created_at
  end

  def api_type_name
    "Feed"
  end
end
