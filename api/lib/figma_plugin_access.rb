# frozen_string_literal: true

class FigmaPluginAccess
  ALLOWED_ROUTES = {
    "api/v1/organizations" => [:index, :show], # GET /v1/organizations, GET /v1/organizations/:org_slug
    "api/v1/posts" => [:create, :presigned_fields], # POST /v1/organizations/:org_slug/posts, PUT /v1/organizations/:org_slug/posts/:post_id, POST /v1/organizations/:org_slug/posts/presigned_fields
    "api/v1/posts/attachments" => [:create], # POST /v1/organizations/:org_slug/posts/:post_id/attachments
    "api/v1/posts/shares" => [:create], # POST /v1/organizations/:org_slug/posts/:post_id/shares
    "api/v1/posts/post_links" => [:create], # POST /v1/organizations/:org_slug/posts/:post_id/post_links
    "api/v1/projects" => [:index, :show], # GET /v1/organizations/:org_slug/projects, # GET /v1/organizations/:org_slug/projects/:project_id
    "api/v1/users" => [:me], # GET /v1/users/me
    "api/v1/search/posts" => [:index], # GET /v1/organizations/:org_slug/search/posts
    "api/v1/product_logs" => [:create], # POST /v1/product_logs
    "api/v1/slack_integrations" => [:show], # GET /v1/organizations/:org_slug/integrations/slack
    "api/v1/integrations/slack/channels" => [:index], # GET /v1/organizations/:org_slug/integrations/slack/channels
    "api/v1/figma/files" => [:create], # POST /v1/organizations/:org_slug/figma/files
    "api/v1/organization_memberships" => [:index, :show], # GET /v1/organizations, GET /v1/organizations/:org_slug
  }

  def self.allowed?(controller:, action:)
    action = action.to_sym

    ALLOWED_ROUTES[controller]&.include?(action) == true
  end
end
