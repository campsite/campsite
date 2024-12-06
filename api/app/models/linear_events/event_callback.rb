# frozen_string_literal: true

module LinearEvents
  class EventCallback
    TYPE = "event_callback"

    attr_reader :params

    def initialize(params)
      @params = params
    end

    def integrations
      @integrations ||= LinearEvent.active_integrations(params["organizationId"])
    end

    def post_id_references
      return @post_id_references if defined?(@post_id_references)

      @post_id_references = extract_post_ids(text_content)
    end

    def associated_integration
      Integration.linear.joins("INNER JOIN posts ON posts.organization_id = integrations.owner_id AND integrations.owner_type = 'Organization'")
        .where(posts: { public_id: post_id_references })
        .first
    end

    def contains_references_from_organization?
      return false unless integrations.any?

      Post.exists?(organization_id: integrations.map(&:owner_id), public_id: post_id_references)
    end

    private

    def organization_id
      params["organizationId"]
    end

    def data_params
      params["data"]
    end
  end
end
