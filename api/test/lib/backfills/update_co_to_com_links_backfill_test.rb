# frozen_string_literal: true

require "test_helper"

module Backfills
  class UpdateCoToComLinksBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "dry run is a no-op" do
        html = <<~HTML.strip
          <a href="https://app.campsite.co/foo-bar/123">Link 1</a>
          <a href="https://app.campsite.com/cat/abc">Link 2</a>
          <a href="https://google.com/noop">Link 3</a>
        HTML

        create(:post, description_html: html)
        create(:comment, body_html: html)
        create(:note, description_html: html)

        UpdateCoToComLinksBackfill.run(dry_run: true)

        assert_enqueued_sidekiq_jobs 0, only: UpdateCoToComLinkJob
      end

      it "updates links" do
        html = <<~HTML.strip
          <a href="https://app.campsite.co/foo-bar/123">Link 1</a>
          <a href="https://app.campsite.com/cat/abc">Link 2</a>
          <a href="https://google.com/noop">Link 3</a>
        HTML

        create(:post, description_html: html)
        create(:comment, body_html: html)
        create(:note, description_html: html)

        UpdateCoToComLinksBackfill.run(dry_run: false)

        assert_enqueued_sidekiq_jobs 3, only: UpdateCoToComLinkJob
      end
    end
  end
end
