# frozen_string_literal: true

class PollOptionSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :description
  api_field :votes_count, type: :number
  api_field :votes_percent, type: :number

  api_field :viewer_voted, type: :boolean do |option, options|
    preloaded = PostSerializer.preloads(options, :viewer_voted_option_ids_by_poll_id)

    if preloaded.nil?
      option.voted?(options[:member])
    else
      !!preloaded.dig(option.poll_id)&.include?(option.id)
    end
  end
end
