# frozen_string_literal: true

module Backfills
  class OauthAccessTokenPreviousTokenBackfill
    def self.run(dry_run: true)
      access_tokens = AccessToken.where(previous_token: nil)
      access_tokens_count = access_tokens.count
      access_tokens.update_all("previous_token = token") unless dry_run
      "#{dry_run ? "Would have updated" : "Updated"} #{access_tokens_count} AccessToken #{"record".pluralize(access_tokens_count)}"
    end
  end
end
