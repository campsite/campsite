# frozen_string_literal: true

class Poll
  class CreatePoll
    include ActiveModel::Model

    attr_accessor :post, :description, :options_attributes
    attr_reader :poll

    validates :options_attributes, length: { minimum: MIN_OPTIONS, maximum: MAX_OPTIONS, message: "length must be between #{MIN_OPTIONS} and #{MAX_OPTIONS}" }

    def initialize(**args)
      @poll = Poll.new
      super
    end

    def save!
      validate!
      poll.update!(post: post, description: description, options_attributes: Array(options_attributes))
    end

    def save
      valid? && save!
    end
  end
end
