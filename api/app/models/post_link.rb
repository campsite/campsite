# frozen_string_literal: true

class PostLink < ApplicationRecord
  include PublicIdGenerator

  SLACK_TS_REGEX = /p\d+/
  SLACK_CHANNEL_REGEX = %r{/C[A-Z0-9]*/}
  SLACK = "slack"
  FIGMA = "figma"

  belongs_to :post

  validates :name, :url, presence: true

  def api_type_name
    "PostLink"
  end

  def slack?
    name == SLACK
  end

  def figma?
    name == FIGMA || url.include?("figma.com")
  end

  # slacks api was designed by the devil himself, you cant easily retrieve a message ts
  # so gots ts do some string parsing to retrieve the message ts from a link
  # The ts format is [10 digits] + "." [couple other digits].
  # eg. so taking "https://campsite-software.slack.com/archives/C03J9D4TQKS/p1662845204796459",
  # we first string match with the following regex /p\d+/ then insert a "." after the 10th digit
  def slack_message_ts
    url.scan(SLACK_TS_REGEX)[0]&.gsub("p", "")&.insert(10, ".")
  end

  def slack_channel_id
    url.scan(SLACK_CHANNEL_REGEX)[0]&.gsub("/", "")
  end
end
