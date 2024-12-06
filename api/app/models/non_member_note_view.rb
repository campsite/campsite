# frozen_string_literal: true

class NonMemberNoteView < ApplicationRecord
  belongs_to :note, inverse_of: :non_member_views
  belongs_to :user, optional: true

  counter_culture :note, column_name: "non_member_views_count"

  def self.find_or_create_from_request!(note:, user:, remote_ip:, user_agent:)
    anonymized_ip = IpAnonymizer.mask_ip(remote_ip)
    view = if user
      find_by(note: note, user: user)
    else
      find_by(note: note, anonymized_ip: anonymized_ip, user_agent: user_agent)
    end

    if view
      view.touch(:updated_at)
    else
      create!(note: note, user: user, anonymized_ip: anonymized_ip, user_agent: user_agent)
    end
  end
end
