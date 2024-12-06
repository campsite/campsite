# frozen_string_literal: true

class NonMemberPostView < ApplicationRecord
  belongs_to :post, inverse_of: :non_member_views
  belongs_to :user, optional: true

  counter_culture :post, column_name: "non_member_views_count"

  def self.find_or_create_from_request!(post:, user:, remote_ip:, user_agent:)
    anonymized_ip = IpAnonymizer.mask_ip(remote_ip)
    view = user ? find_by(post: post, user: user) : find_by(post: post, anonymized_ip: anonymized_ip, user_agent: user_agent)

    if view
      view.touch(:updated_at)
    else
      create!(post: post, user: user, anonymized_ip: anonymized_ip, user_agent: user_agent)
    end
  end
end
