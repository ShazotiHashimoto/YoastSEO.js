let AssessmentResult = require( "../../values/AssessmentResult.js" );
let Assessment = require( "../../assessment.js" );
let merge = require( "lodash/merge" );

/**
 * Represents the assessment that will look if the images have alt-tags and checks if the keyword is present in one of them.
 */
class TextImagesAssessment extends Assessment {
	/**
	 * Sets the identifier and the config.
	 *
	 * @param {object} config The configuration to use.
	 *
	 * @returns {void}
	 */
	constructor( config = {} ) {
		super();

		let defaultConfig = {
			scores: {
				noImages: 3,
				withAltKeyword: 9,
				withAltNonKeyword: 6,
				withAlt: 6,
				noAlt: 6,
			},
		};

		this.identifier = "textImages";
		this._config = merge( defaultConfig, config );
	}

	/**
	 * Execute the Assessment and return a result.
	 *
	 * @param {Paper} paper The Paper object to assess.
	 * @param {Researcher} researcher The Researcher object containing all available researches.
	 * @param {object} i18n The locale object.
	 *
	 * @returns {AssessmentResult} The result of the assessment, containing both a score and a descriptive text.
	 */
	getResult( paper, researcher, i18n ) {
		let assessmentResult = new AssessmentResult();
		let imageCount = researcher.getResearch( "imageCount" );
		let altProperties = researcher.getResearch( "altTagCount" );

		assessmentResult.setScore( this.calculateScore( imageCount, altProperties ) );
		assessmentResult.setText( this.translateScore( imageCount, altProperties, i18n ) );

		return assessmentResult;
	}

	/**
	 * Checks whether the paper has text.
	 *
	 * @param {Paper} paper The paper to use for the assessment.
	 *
	 * @returns {boolean} True when there is text.
	 */
	isApplicable( paper ) {
		return paper.hasText();
	}

	/**
	 * Calculate the score based on the current image count and current image alt-tag count.
	 *
	 * @param {number} imageCount The amount of images to be checked against.
	 * @param {object} altProperties An object containing the various alt-tags.
	 *
	 * @returns {number} The calculated score.
	 */
	calculateScore( imageCount, altProperties ) {
		if ( imageCount === 0 ) {
			return this._config.scores.noImages;
		}

		// Has alt-tag and keywords
		if ( altProperties.withAltKeyword > 0 ) {
			return this._config.scores.withAltKeyword;
		}

		// Has alt-tag, but no keywords and it's not okay
		if ( altProperties.withAltNonKeyword > 0 ) {
			return this._config.scores.withAltNonKeyword;
		}

		// Has alt-tag, but no keyword is set
		if ( altProperties.withAlt > 0 ) {
			return this._config.scores.withAlt;
		}

		// Has no alt-tag
		if ( altProperties.noAlt > 0 ) {
			return this._config.scores.noAlt;
		}

		return null;
	}

	/**
	 * Translates the score to a message the user can understand.
	 *
	 * @param {number} imageCount The amount of images to be checked against.
	 * @param {object} altProperties An object containing the various alt-tags.
	 * @param {object} i18n The object used for translations.
	 *
	 * @returns {string} The translated string.
	 */
	translateScore( imageCount, altProperties, i18n ) {
		if ( imageCount === 0 ) {
			return i18n.dgettext( "js-text-analysis", "No images appear in this page, consider adding some as appropriate." );
		}

		// Has alt-tag and keywords
		if ( altProperties.withAltKeyword > 0 ) {
			return i18n.dgettext( "js-text-analysis", "The images on this page contain alt attributes with the focus keyword." );
		}

		// Has alt-tag, but no keywords and it's not okay
		if ( altProperties.withAltNonKeyword > 0 ) {
			return i18n.dgettext( "js-text-analysis", "The images on this page do not have alt attributes containing the focus keyword." );
		}

		// Has alt-tag, but no keyword is set
		if ( altProperties.withAlt > 0 ) {
			return i18n.dgettext( "js-text-analysis", "The images on this page contain alt attributes." );
		}

		// Has no alt-tag
		if ( altProperties.noAlt > 0 ) {
			return i18n.dgettext( "js-text-analysis", "The images on this page are missing alt attributes." );
		}

		return "";
	}
}

module.exports = TextImagesAssessment;
