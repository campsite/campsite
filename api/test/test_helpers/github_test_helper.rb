# frozen_string_literal: true

module GithubTestHelper
  def github_request_signature_headers(secret:, params:)
    digest = OpenSSL::Digest.new("SHA256")
    computed_signature = "sha256=" + OpenSSL::HMAC.hexdigest(digest, secret, params)

    {
      "X-Hub-Signature-256" => computed_signature,
      "X-GitHub-Event" => "pull_request",
    }
  end
end
