# frozen_string_literal: true

module Pinnable
  extend ActiveSupport::Concern

  included do
    has_one :pin, as: :subject, class_name: "ProjectPin", dependent: :destroy_async

    def self.pin_public_ids_async(ids, membership)
      return AsyncPreloader.value({}) unless membership

      scope = ProjectPin
        # using MIN lets us get the first public_id for each subject_id since there will only ever be one
        .select("subject_id, MIN(public_id) AS public_id")
        .where(subject_type: polymorphic_name, subject_id: ids, discarded_at: nil)
        .group(:subject_id)
        .load_async

      AsyncPreloader.new(scope) { |scope| scope.map { |pin| [pin.subject_id, pin.public_id] }.to_h }
    end
  end
end
