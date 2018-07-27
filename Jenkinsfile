properties([
    parameters([
        credentials(
            credentialType: 'com.microsoft.jenkins.kubernetes.credentials.KubeconfigCredentials',
            defaultValue: 'kubeconfig-dev',
            description: 'Environment to deploy to',
            name: 'kubernetesCreds',
            required: true
        )
    ])
])

def image
def scmVars

node('master') {
    ansiColor('xterm') {
        stage('Checkout') {
            scmVars = checkout scm
            GIT_COMMIT_HASH = sh (
                script: 'git rev-parse HEAD',
                returnStdout: true
            ).trim()
        }
        stage('Build') {
            image = docker.build("scos/cota-streaming-ui:${GIT_COMMIT_HASH}")
        }

        if (scmVars.GIT_BRANCH == 'master') {
            stage('Publish') {
                docker.withRegistry("https://199837183662.dkr.ecr.us-east-2.amazonaws.com", "ecr:us-east-2:aws_jenkins_user") {
                    image.push()
                    image.push('latest')
                }
            }
            stage('Deploy') {
                sh("sed -i 's/%VERSION%/${GIT_COMMIT_HASH}/' k8s/deployment/1-deployment.yaml")
                kubernetesDeploy(kubeconfigId: "${params.kubernetesCreds}",
                    configs: 'k8s/configs/dev.yaml,k8s/deployment/*',
                    secretName: 'regcred',
                    dockerCredentials: [
                        [credentialsId: 'ecr:us-east-2:aws_jenkins_user', url: 'https://199837183662.dkr.ecr.us-east-2.amazonaws.com'],
                    ]
                )
            }
        }
    }
}
