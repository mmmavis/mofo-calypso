/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-backup-codes' );

/**
 * Internal dependencies
 */
var Security2faBackupCodesPrompt = require( 'me/security-2fa-backup-codes-prompt' ),
	SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' ),
	eventRecorder = require( 'me/event-recorder' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	Security2faBackupCodesList = require( 'me/security-2fa-backup-codes-list' );

module.exports = React.createClass( {

	displayName: 'Security2faBackupCodes',

	mixins: [ eventRecorder ],

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	getInitialState: function() {
		var printed = this.props.userSettings.getSetting( 'two_step_backup_codes_printed' );

		return {
			printed: printed,
			verified: printed,
			showPrompt: ! printed,
			backupCodes: [],
			generatingCodes: false
		};
	},

	onGenerate: function() {
		this.setState( {
			generatingCodes: true,
			verified: false,
			showPrompt: true
		} );

		twoStepAuthorization.backupCodes( this.onRequestComplete );
	},

	onRequestComplete: function( error, data ) {
		if ( error ) {
			this.setState( {
				lastError: this.translate( 'Unable to obtain backup codes.  Please try again later.' )
			} );
			return;
		}

		this.setState( {
			backupCodes: data.codes,
			generatingCodes: false
		} );
	},

	onNextStep: function() {
		this.setState( {
			backupCodes: [],
			printed: true,
		} );
	},

	onVerified: function() {
		this.setState( {
			printed: true,
			verified: true,
			showPrompt: false
		} );
	},

	renderStatus: function() {
		if ( ! this.state.printed ) {
			return (
				this.translate(
					'{{status}}Status:{{/status}} Backup Codes have {{notVerified}}not been verified{{/notVerified}}.',
					{
						components: {
							status: <span className="security-2fa-backup-codes__status-heading"/>,
							notVerified: <span className="security-2fa-backup-codes__status-not-verified"/>
						}
					}
				)
			);
		}

		if ( ! this.state.verified ) {
			return (
				this.translate(
					'{{verify}}New backup Codes have just been generated, but need to be verified. ' +
					'Please enter one of them below for verification.{{/verify}}',
					{
						components: {
							verify: <span className="security-2fa-backup-codes__status-need-verification"/>,
						}
					}
				)
			);
		}

		return (
			this.translate(
				'{{status}}Status:{{/status}} Backup Codes have been {{verified}}verified{{/verified}}.',
				{
					components: {
						status: <span className="security-2fa-backup-codes__status-heading"/>,
						verified: <span className="security-2fa-backup-codes__status-verified"/>
					}
				}
			)
		);
	},

	renderList: function() {
		return (
			<Security2faBackupCodesList
				backupCodes={ this.state.backupCodes }
				onNextStep={ this.onNextStep }
				userSettings={ this.props.userSettings }
				showList
			/>
		);
	},

	renderPrompt: function() {
		return (
			<div>
				<p>
					{
						this.translate(
							'Backup codes let you access your account if your phone is ' +
							'lost, stolen, or if you run it through the washing ' +
							'machine and the bag of rice trick doesn\'t work.'
						)
					}
				</p>

				<p className="security-2fa-backup-codes__status">{ this.renderStatus() }</p>

				{ this.state.showPrompt &&
					<Security2faBackupCodesPrompt onSuccess={ this.onVerified } />
				}
			</div>
		);
	},

	render: function() {
		return (
			<div className="security-2fa-backup-codes">
				<SectionHeader label={ this.translate( 'Backup Codes' ) }>
					<Button
						compact
						disabled={ this.state.generatingCodes || !! this.state.backupCodes.length }
						onClick={ this.recordClickEvent( 'Generate New Backup Codes Button', this.onGenerate ) }
					>
						{ this.translate( 'Generate New Backup Codes' ) }
					</Button>
				</SectionHeader>
				<Card>
					{
						this.state.generatingCodes || this.state.backupCodes.length
						? this.renderList()
						: this.renderPrompt()
					}
				</Card>
			</div>
		);
	}
} );
