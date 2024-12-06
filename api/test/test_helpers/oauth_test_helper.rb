# frozen_string_literal: true

module OauthTestHelper
  def bearer_token_header(token)
    { "Authorization" => "Bearer #{token}" }
  end

  def org_header(org_slug)
    { "x-campsite-org" => org_slug }
  end

  def oauth_request_headers(token: nil, org_slug: nil)
    headers = {}
    headers.merge!(bearer_token_header(token)) if token
    headers.merge!(org_header(org_slug)) if org_slug
    headers
  end
end
